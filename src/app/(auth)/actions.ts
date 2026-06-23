'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  charity_id: z.string().optional().nullable(),
  charity_percentage: z.number().int().min(10).max(100)
})

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const emailRaw = formData.get('email')
  const passwordRaw = formData.get('password')

  const parsed = loginSchema.safeParse({ email: emailRaw, password: passwordRaw })
  
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const emailRaw = formData.get('email')
  const passwordRaw = formData.get('password')
  const fullNameRaw = formData.get('full_name')
  const charityIdRaw = formData.get('charity_id')
  const charityPercentageRaw = formData.get('charity_percentage')

  const parsed = signupSchema.safeParse({
    email: emailRaw,
    password: passwordRaw,
    full_name: fullNameRaw,
    charity_id: charityIdRaw || null,
    charity_percentage: parseInt(charityPercentageRaw as string, 10) || 10
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { email, password, full_name, charity_id, charity_percentage } = parsed.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        charity_id,
        charity_percentage
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/login?message=check_email')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
