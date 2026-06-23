'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const simulateSchema = z.object({
  monthName: z.string().min(1, "Month name is required"),
  drawType: z.enum(['random', 'algorithmic'])
})

export async function simulateDraw(formData: FormData) {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const monthNameRaw = formData.get('monthName')
  const drawTypeRaw = formData.get('drawType')

  const parsed = simulateSchema.safeParse({ monthName: monthNameRaw, drawType: drawTypeRaw })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { monthName, drawType } = parsed.data

  // Check if there's already a simulated draw and discard it
  const { data: existingSim } = await supabase.from('draws').select('id').eq('status', 'simulated').single()
  if (existingSim) {
    await supabase.from('winners').delete().eq('draw_id', existingSim.id)
    await supabase.from('draws').delete().eq('id', existingSim.id)
  }

  const winningNumbers = new Set<number>()

  if (drawType === 'random') {
    // 1. Generate 5 random winning numbers between 1 and 45
    while (winningNumbers.size < 5) {
      winningNumbers.add(Math.floor(Math.random() * 45) + 1)
    }
  } else {
    // Algorithmic: Weight by most frequent user scores
    const { data: allScores } = await supabase.from('scores').select('score')
    const frequencyMap = new Map<number, number>()
    
    // Initialize 1-45 with a base weight of 1
    for (let i = 1; i <= 45; i++) {
      frequencyMap.set(i, 1)
    }

    // Add +1 weight for every time a user has played a number
    if (allScores) {
      for (const s of allScores) {
        frequencyMap.set(s.score, (frequencyMap.get(s.score) || 1) + 1)
      }
    }

    // Create a weighted array
    const weightedArray: number[] = []
    frequencyMap.forEach((weight, num) => {
      for (let i = 0; i < weight; i++) {
        weightedArray.push(num)
      }
    })

    // Draw 5 unique numbers based on frequency weights
    while (winningNumbers.size < 5) {
      const randomIndex = Math.floor(Math.random() * weightedArray.length)
      winningNumbers.add(weightedArray[randomIndex])
    }
  }
  
  const finalNumbers = Array.from(winningNumbers).sort((a, b) => a - b)

  // 2. Fetch all active subscribers
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id, plan_type')
    .eq('status', 'active')

  const activeSubscribers = subscriptions || []
  
  // Calculate exact revenue based on plan type (yearly is 4999/12 ≈ 416.58)
  const totalRevenue = activeSubscribers.reduce((sum, sub) => {
    return sum + (sub.plan_type === 'yearly' ? (4999 / 12) : 499)
  }, 0)
  
  const prizePool = totalRevenue * 0.50
  const jackpotPool = prizePool * 0.40
  const fourMatchPool = prizePool * 0.35
  const threeMatchPool = prizePool * 0.25

  // Fetch accumulated jackpot from previous draws
  const { data: previousDraws } = await supabase
    .from('draws')
    .select('accumulated_jackpot')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)

  const rolloverJackpot = previousDraws?.[0]?.accumulated_jackpot || 0

  // Create the simulated draw record
  const { data: draw, error: drawError } = await supabase.from('draws').insert({
    draw_date: new Date().toISOString().split('T')[0],
    draw_month: monthName,
    numbers: finalNumbers,
    draw_type: drawType,
    status: 'simulated',
    total_pool: totalRevenue,
    jackpot_pool: jackpotPool + rolloverJackpot, // add rollover
    four_match_pool: fourMatchPool,
    three_match_pool: threeMatchPool,
    accumulated_jackpot: 0 // calculated on publish
  }).select().single()

  if (drawError) throw new Error(drawError.message)

  // 3. Match user scores
  const potentialWinners = []
  let match5Count = 0
  let match4Count = 0
  let match3Count = 0

  for (const sub of activeSubscribers) {
    // Get their 5 most recent scores
    const { data: scores } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', sub.user_id)
      .order('played_date', { ascending: false })
      .limit(5)
    
    if (!scores || scores.length === 0) continue

    const userNumbers = Array.from(new Set(scores.map(s => s.score)))
    const matchedNumbers = userNumbers.filter(n => finalNumbers.includes(n))
    const matchCount = matchedNumbers.length

    if (matchCount >= 3) {
      if (matchCount === 5) match5Count++
      else if (matchCount === 4) match4Count++
      else if (matchCount === 3) match3Count++

      potentialWinners.push({
        draw_id: draw.id,
        user_id: sub.user_id,
        match_count: matchCount,
        matched_numbers: matchedNumbers,
      })
    }
  }

  // Assign prizes equally among winners in the same tier
  const winnersToInsert = potentialWinners.map(pw => {
    let prizeAmount = 0
    if (pw.match_count === 5 && match5Count > 0) prizeAmount = Math.floor((jackpotPool + rolloverJackpot) / match5Count)
    else if (pw.match_count === 4 && match4Count > 0) prizeAmount = Math.floor(fourMatchPool / match4Count)
    else if (pw.match_count === 3 && match3Count > 0) prizeAmount = Math.floor(threeMatchPool / match3Count)
    
    return {
      ...pw,
      prize_amount: prizeAmount
    }
  })

  // Insert simulated winners
  if (winnersToInsert.length > 0) {
    await supabase.from('winners').insert(winnersToInsert)
  }

  revalidatePath('/admin/draws')
}

export async function publishDraw(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const drawId = formData.get('drawId') as string
  if (!drawId) throw new Error('Draw ID is required')

  // Check if jackpot was won to calculate new accumulated jackpot
  const { count: jackpotWinners } = await supabase
    .from('winners')
    .select('*', { count: 'exact', head: true })
    .eq('draw_id', drawId)
    .eq('match_count', 5)

  const { data: draw } = await supabase.from('draws').select('jackpot_pool').eq('id', drawId).single()
  
  const newAccumulatedJackpot = (jackpotWinners && jackpotWinners > 0) ? 0 : (draw?.jackpot_pool || 0)

  // Publish
  const { error } = await supabase.from('draws').update({
    status: 'published',
    published_at: new Date().toISOString(),
    accumulated_jackpot: newAccumulatedJackpot
  }).eq('id', drawId)

  if (error) throw new Error(error.message)

  try {
    const { data: winners } = await supabase
      .from('winners')
      .select('user_id, prize_amount, draws(draw_month)')
      .eq('draw_id', drawId)

    if (winners && winners.length > 0) {
      const { sendWinnerNotificationEmail } = await import('@/lib/email')
      for (const w of winners) {
        const { data: profile } = await supabase.from('profiles').select('email').eq('id', w.user_id).single()
        if (profile?.email) {
          await sendWinnerNotificationEmail(profile.email, w.prize_amount, (w.draws as any).draw_month)
        }
      }
    }
  } catch (e) {
    console.error("Failed to send winner emails", e)
  }

  revalidatePath('/admin/draws')
  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/winnings')
}

export async function discardSimulation(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const drawId = formData.get('drawId') as string
  if (!drawId) throw new Error('Draw ID is required')

  // Delete the simulated draw (cascades to delete simulated winners)
  const { error } = await supabase.from('draws').delete().eq('id', drawId).eq('status', 'simulated')

  if (error) throw new Error(error.message)

  revalidatePath('/admin/draws')
}
