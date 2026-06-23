'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Zod Schema for Score Input
const scoreSchema = z.object({
  score: z.number().int().min(1).max(45, "Score must be between 1 and 45"),
  playedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
})

export async function addScoreAction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const scoreRaw = formData.get('score')
  const dateRaw = formData.get('date')

  const parsed = scoreSchema.safeParse({
    score: Number(scoreRaw),
    playedDate: dateRaw
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { score, playedDate } = parsed.data

  // Check unique date
  const { data: existing } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', user.id)
    .eq('played_date', playedDate)
    .single()

  if (existing) {
    throw new Error('A score already exists for this date.')
  }

  // Insert
  const { error } = await supabase.from('scores').insert({
    user_id: user.id,
    score,
    played_date: playedDate
  })

  if (error) {
    throw new Error(error.message)
  }

  // Enforce 5 score limit (prune excess)
  const { data: top5 } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', user.id)
    .order('played_date', { ascending: false })
    .limit(5)

  if (top5 && top5.length === 5) {
    const idsToKeep = top5.map(s => s.id)
    await supabase.from('scores').delete()
      .eq('user_id', user.id)
      .not('id', 'in', `(${idsToKeep.join(',')})`)
  }

  revalidatePath('/dashboard/scores')
  revalidatePath('/dashboard')
}

export async function updateScoreAction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const id = formData.get('id') as string
  const scoreRaw = formData.get('score')
  const dateRaw = formData.get('date')

  if (!id) throw new Error('ID is required')

  const parsed = scoreSchema.safeParse({
    score: Number(scoreRaw),
    playedDate: dateRaw
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { score, playedDate } = parsed.data

  // Check unique date
  const { data: existing } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', user.id)
    .eq('played_date', playedDate)
    .neq('id', id)
    .single()

  if (existing) {
    throw new Error('A score already exists for this date.')
  }

  const { error } = await supabase.from('scores').update({
    score,
    played_date: playedDate
  }).eq('id', id).eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/scores')
  revalidatePath('/dashboard')
}

export async function deleteScoreAction(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('scores').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/scores')
  revalidatePath('/dashboard')
}
