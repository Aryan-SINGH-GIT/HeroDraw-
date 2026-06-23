'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function processClaim(formData: FormData) {
  const supabase = await createClient()

  // Verify admin status
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const winId = formData.get('winId') as string
  const action = formData.get('action') as string

  if (!winId || !['approve', 'reject'].includes(action)) {
    throw new Error('Invalid request')
  }

  const updates: any = {
    verification_status: action === 'approve' ? 'approved' : 'rejected',
    verified_at: new Date().toISOString()
  }

  if (action === 'approve') {
    updates.payment_status = 'paid'
  }

  const { error } = await supabase
    .from('winners')
    .update(updates)
    .eq('id', winId)

  if (error) {
    throw new Error('Failed to process claim')
  }

  revalidatePath('/admin/winnings')
}
