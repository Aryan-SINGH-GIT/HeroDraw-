'use client'

import { useEffect, useState } from 'react'
import { signup } from '../actions'
import Link from 'next/link'
import { useFormState, useFormStatus } from 'react-dom'
import { createClient } from '@/lib/supabase/client'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full btn-accent flex justify-center disabled:opacity-50 mt-6"
    >
      {pending ? 'Creating account...' : 'Create Account'}
    </button>
  )
}

interface Charity {
  id: string;
  name: string;
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signup, null)
  const [charities, setCharities] = useState<Charity[]>([])
  const [percentage, setPercentage] = useState(10)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCharities() {
      const supabase = createClient()
      const { data } = await supabase
        .from('charities')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
      setCharities(data || [])
      setLoading(false)
    }
    fetchCharities()
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-primary">Create Account</h1>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="p-3 text-sm text-red-400 bg-red-900/30 border border-red-500/30 rounded-md">
            {state.error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Full Name</label>
          <input type="text" name="full_name" required className="input-field" placeholder="John Doe" />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Email</label>
          <input type="email" name="email" required className="input-field" placeholder="you@example.com" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Password</label>
          <input type="password" name="password" required className="input-field" placeholder="••••••••" minLength={6} />
        </div>

        <div className="pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-primary mb-2">Charity Support</h3>
          <p className="text-xs text-muted mb-4">A portion of your subscription goes to charity.</p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Select Charity</label>
              <select name="charity_id" className="input-field">
                <option value="" className="bg-surface text-white">
                  {loading ? 'Loading charities...' : 'Choose a charity...'}
                </option>
                {charities.map(c => (
                  <option key={c.id} value={c.id} className="bg-surface text-white">{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium text-secondary mb-1">Contribution</label>
                <span className="text-sm font-medium text-accent">{percentage}%</span>
              </div>
              <input 
                type="range" 
                name="charity_percentage" 
                min="10" 
                max="100" 
                value={percentage}
                onChange={(e) => setPercentage(parseInt(e.target.value))}
                className="w-full accent-[var(--accent)]" 
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>Min 10%</span>
                <span>Max 100%</span>
              </div>
            </div>
          </div>
        </div>

        <SubmitButton />
      </form>

      <div className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  )
}
