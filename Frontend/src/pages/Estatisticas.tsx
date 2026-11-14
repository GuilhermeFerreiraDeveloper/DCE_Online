import { useEffect, useState } from 'react'
import {
  Ban,
  BarChart3,
  BookOpen,
  CircleDot,
  FileWarning,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'
import { InlineError, Spinner } from '@/components/ui/Feedback'
import { dceApi } from '@/services/api'
import type { Estatisticas as Stats } from '@/types'

const CARDS: { chave: keyof Stats; label: string; icon: typeof Users; cls: string }[] = [
  { chave: 'totalDetentos', label: 'Total de Fichas', icon: BarChart3, cls: 'text-slate-200' },
  { chave: 'emCustodia', label: 'Em Custódia', icon: ShieldAlert, cls: 'text-red-300' },
  { chave: 'foragidos', label: 'Foragidos', icon: UserX, cls: 'text-orange-300' },
  { chave: 'liberados', label: 'Liberados', icon: ShieldCheck, cls: 'text-emerald-300' },
  { chave: 'emSolitaria', label: 'Em Solitária', icon: Ban, cls: 'text-fuchsia-300' },
  { chave: 'exigeTornozeleira', label: 'Com Tornozeleira', icon: CircleDot, cls: 'text-amber-300' },
  { chave: 'oficiaisAtivos', label: 'Oficiais Ativos', icon: Users, cls: 'text-sky-300' },
  { chave: 'oficiaisPendentes', label: 'Cadastros Pendentes', icon: UserCheck, cls: 'text-gold-300' },
  { chave: 'totalArtigos', label: 'Artigos no Código Penal', icon: BookOpen, cls: 'text-slate-200' },
  { chave: 'totalOcorrencias', label: 'Ocorrências Registradas', icon: FileWarning, cls: 'text-slate-300' },
]

export default function Estatisticas() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        setStats(await dceApi.estatisticas())
      } catch {
        setErro('Não foi possível carregar as estatísticas.')
      }
    })()
  }, [])

  return (
    <div className="space-y-6">
      <header>
        <p className="dce-section-title">
          <BarChart3 size={14} /> Comando / Staff
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-white">Estatísticas Gerais</h1>
        <p className="mt-1 text-sm text-slate-400">Panorama consolidado do sistema de custódia do estado.</p>
      </header>

      {erro && <InlineError>{erro}</InlineError>}
      {!stats && !erro && <Spinner label="Calculando indicadores..." />}

      {stats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CARDS.map((c) => (
            <div key={c.chave} className="dce-panel flex flex-col gap-2 p-4">
              <c.icon size={20} className={c.cls} />
              <p className="font-display text-3xl leading-none text-white">{stats[c.chave]}</p>
              <p className="text-[0.68rem] uppercase tracking-wider text-slate-500">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
