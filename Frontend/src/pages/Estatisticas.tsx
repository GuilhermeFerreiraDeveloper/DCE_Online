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
  Trophy
} from 'lucide-react'
import { InlineError, Spinner } from '@/components/ui/Feedback'
import { dceApi } from '@/services/api'
import type { Estatisticas as Stats, RankingPonto } from '@/types'

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
  const [ranking, setRanking] = useState<RankingPonto[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const [s, r] = await Promise.all([dceApi.estatisticas(), dceApi.pontoRanking()])
        setStats(s)
        setRanking(r)
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

      {stats && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* RANKING DE PONTO */}
          <div className="dce-panel overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-5 py-4">
              <Trophy size={18} className="text-gold-400" />
              <h3 className="font-display text-lg font-bold uppercase text-white">Ranking Semanal de Horas</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-950 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Pos.</th>
                    <th className="px-5 py-3">Oficial</th>
                    <th className="px-5 py-3">Patente</th>
                    <th className="px-5 py-3 text-right">Total Horas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ranking.map((r, i) => (
                    <tr key={r.oficialId} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-3 font-bold text-gold-400">{i + 1}º</td>
                      <td className="px-5 py-3 font-medium text-white">{r.nomeOficial}</td>
                      <td className="px-5 py-3 uppercase text-slate-400">{r.patente}</td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-gold-200">
                        {Math.floor(r.totalMinutos / 60)}h {r.totalMinutos % 60}m
                      </td>
                    </tr>
                  ))}
                  {ranking.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-500">Nenhum registro de ponto esta semana.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
