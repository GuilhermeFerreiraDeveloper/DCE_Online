import type { ReactNode } from 'react'
import { AlertTriangle, Loader2, SearchX } from 'lucide-react'

export function Spinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-slate-400">
      <Loader2 size={20} className="animate-spin text-gold-400" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function EmptyState({
  titulo,
  descricao,
  icone,
  acao,
}: {
  titulo: string
  descricao?: string
  icone?: ReactNode
  acao?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
      <div className="text-slate-500">{icone ?? <SearchX size={30} />}</div>
      <h4 className="font-display text-base text-slate-200">{titulo}</h4>
      {descricao && <p className="max-w-md text-sm text-slate-400">{descricao}</p>}
      {acao}
    </div>
  )
}

export function InlineError({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

export function InlineSuccess({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
      {children}
    </div>
  )
}
