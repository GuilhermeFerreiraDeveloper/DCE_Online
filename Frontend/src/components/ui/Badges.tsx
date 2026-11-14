import type { ReactNode } from 'react'
import { AlertTriangle, CircleDot, ShieldAlert, ShieldCheck, UserX } from 'lucide-react'
import type { NivelPericulosidade, StatusConta, StatusPrisao } from '@/types'

interface TagProps {
  children: ReactNode
  className?: string
}

export function Tag({ children, className = '' }: TagProps) {
  return <span className={`dce-tag ${className}`}>{children}</span>
}

export function StatusPrisaoBadge({ status }: { status: StatusPrisao }) {
  const map: Record<StatusPrisao, { label: string; cls: string; icon: ReactNode }> = {
    EM_CUSTODIA: {
      label: 'Em Custódia',
      cls: 'border-red-500/40 bg-red-500/10 text-red-300',
      icon: <ShieldAlert size={13} />,
    },
    LIBERADO: {
      label: 'Em Liberdade',
      cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      icon: <ShieldCheck size={13} />,
    },
    FORAGIDO: {
      label: 'Foragido',
      cls: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
      icon: <UserX size={13} />,
    },
  }
  const it = map[status]
  return (
    <Tag className={it.cls}>
      {it.icon}
      {it.label}
    </Tag>
  )
}

export function StatusContaBadge({ status }: { status: StatusConta }) {
  const map: Record<StatusConta, { label: string; cls: string }> = {
    ATIVO: { label: 'Ativo', cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
    PENDENTE: { label: 'Pendente', cls: 'border-gold-500/40 bg-gold-500/10 text-gold-300' },
    BLOQUEADO: { label: 'Bloqueado', cls: 'border-red-500/40 bg-red-500/10 text-red-300' },
  }
  const it = map[status]
  return <Tag className={it.cls}>{it.label}</Tag>
}

export function PericulosidadeBadge({ nivel }: { nivel: NivelPericulosidade }) {
  const map: Record<NivelPericulosidade, { label: string; cls: string; dot: string }> = {
    BAIXO: { label: 'Baixo', cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', dot: '🟢' },
    MODERADO: { label: 'Moderado', cls: 'border-amber-500/40 bg-amber-500/10 text-amber-300', dot: '🟡' },
    ALTO: { label: 'Alto / Perigoso', cls: 'border-red-500/40 bg-red-500/10 text-red-300', dot: '🔴' },
  }
  const it = map[nivel]
  return (
    <Tag className={it.cls}>
      <span aria-hidden>{it.dot}</span>
      {it.label}
    </Tag>
  )
}

export function TornozeleiraTag() {
  return (
    <Tag className="border-amber-500/40 bg-amber-500/10 text-amber-300">
      <CircleDot size={13} className="animate-pulse-alert" />
      Tornozeleira
    </Tag>
  )
}

export function FiancaTag({ permite, valor }: { permite: boolean; valor?: number }) {
  if (!permite)
    return (
      <Tag className="border-red-500/40 bg-red-500/10 text-red-300">
        <AlertTriangle size={13} />
        Inafiançável
      </Tag>
    )
  return (
    <Tag className="border-sky-500/40 bg-sky-500/10 text-sky-300">
      Fiança permitida{valor != null ? ` · ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : ''}
    </Tag>
  )
}

export function SolitariaTag() {
  return (
    <Tag className="border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300">
      Regime Disciplinar
    </Tag>
  )
}
