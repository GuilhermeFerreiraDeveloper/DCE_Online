import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  children: ReactNode
  hint?: string
  className?: string
}

export function Field({ label, children, hint, className = '' }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="dce-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}
