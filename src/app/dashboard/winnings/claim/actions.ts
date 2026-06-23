'use server'

import { createClient } from '@/lib/supabase/server'
import { adminAuthClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitClaim(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const winId = formData.get('winId') as string
  const file = formData.get('proof') as File

  if (!winId || !file || file.size === 0) {
    throw new Error('Valid proof image is required')
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed')
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB')
  }

  // 1. Verify the win belongs to user and is unverified
  const { data: win, error: winError } = await supabase
    .from('winners')
    .select('*, profiles ( charity_percentage, charity_id )')
    .eq('id', winId)
    .eq('user_id', user.id)
    .single()

  if (winError || !win || win.proof_url) {
    throw new Error('Invalid claim request')
  }

  // 2. Upload the file to Supabase Storage
  // Make sure the filename is somewhat unique to avoid collisions
  const fileExt = file.name.split('.').pop()
  const fileName = `${winId}-${Date.now()}.${fileExt}`
  const fileBuffer = await file.arrayBuffer()

  const { data: uploadData, error: uploadError } = await adminAuthClient.storage
    .from('winner-proofs')
    .upload(`proofs/${fileName}`, fileBuffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    })

  if (uploadError) {
    throw new Error(`Failed to upload proof: ${uploadError.message}`)
  }

  // Get the public URL
  const { data: { publicUrl } } = adminAuthClient.storage
    .from('winner-proofs')
    .getPublicUrl(`proofs/${fileName}`)

  // 3. Calculate Charity Contribution
  const charityPercentage = win.profiles?.charity_percentage || 10
  const charityAmount = Math.floor(win.prize_amount * (charityPercentage / 100))
  const charityId = win.profiles?.charity_id

  // 4. Update the DB in a batch/transaction-like way
  if (charityId && charityAmount > 0) {
    const { error: charityError } = await adminAuthClient.from('charity_contributions').insert({
      user_id: user.id,
      charity_id: charityId,
      amount: charityAmount,
      contribution_type: 'donation'
    })
    if (charityError) throw new Error(`Charity Insert Failed: ${charityError.message}`)
  }

  const { error: updateError } = await adminAuthClient.from('winners').update({
    proof_url: publicUrl,
    verification_status: 'pending'
  }).eq('id', winId)

  if (updateError) {
    throw new Error(`Winner Update Failed: ${updateError.message}`)
  }

  revalidatePath('/dashboard/winnings')
  revalidatePath('/dashboard/charity')
  redirect('/dashboard/winnings')
}
