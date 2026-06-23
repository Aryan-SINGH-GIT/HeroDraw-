'use client'

import { useFormState } from 'react-dom'
import { login } from '../actions'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full btn-accent flex justify-center disabled:opacity-50"
    >
      {pending ? 'Signing in...' : 'Sign In'}
    </button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, null)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-primary">Sign In</h1>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-md text-sm mb-6 text-center">
            {state.error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Email</label>
          <input 
            type="email" 
            name="email" 
            required 
            className="input-field" 
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Password</label>
          <input 
            type="password" 
            name="password" 
            required 
            className="input-field" 
            placeholder="••••••••"
          />
        </div>

        <SubmitButton />
      </form>

      <div className="text-center text-sm text-muted">
        Don't have an account?{' '}
        <Link href="/signup" className="text-accent hover:underline font-medium">
          Sign up
        </Link>
      </div>
    </div>
  )
}
