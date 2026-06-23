'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { ReactNode } from 'react'

export function SubmitButton({ 
  children, 
  className, 
  loadingText,
  disabled,
  name,
  value
}: { 
  children: ReactNode, 
  className?: string,
  loadingText?: string,
  disabled?: boolean,
  name?: string,
  value?: string
}) {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      name={name}
      value={value}
      disabled={pending || disabled} 
      className={`flex items-center justify-center gap-2 ${className || ''} ${pending || disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending && loadingText ? loadingText : children}
    </button>
  )
}
