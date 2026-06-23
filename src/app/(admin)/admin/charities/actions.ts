'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCharity(formData: FormData) {
  const supabase = await createClient()

  // Verify admin status
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const websiteUrl = formData.get('websiteUrl') as string

  if (!name) throw new Error('Name is required')

  const { error } = await supabase.from('charities').insert({
    name,
    description,
    website_url: websiteUrl,
    is_active: true
  })

  if (error) {
    throw new Error('Failed to add charity')
  }

  revalidatePath('/admin/charities')
  revalidatePath('/dashboard/charity')
}

export async function toggleCharityStatus(formData: FormData) {
  const supabase = await createClient()

  // Verify admin status
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const charityId = formData.get('charityId') as string
  const currentStatus = formData.get('currentStatus') === 'true'

  const { error } = await supabase
    .from('charities')
    .update({ is_active: !currentStatus })
    .eq('id', charityId)

  if (error) {
    throw new Error('Failed to toggle status')
  }

  revalidatePath('/admin/charities')
  revalidatePath('/dashboard/charity')
}
