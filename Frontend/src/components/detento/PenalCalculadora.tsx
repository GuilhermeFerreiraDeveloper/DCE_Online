import { AlertTriangle, CalendarClock, CircleDollarSign, Gavel, ShieldAlert, Timer } from 'lucide-react'
import type { CodigoPenalArtigo } from '@/types'
import { formatBRL, formatDateTime, mesesParaTexto } from '@/utils/format'
import { calcularPena } from '@/utils/penal'

interface Props {
  artigosSelecionados: CodigoPenalArtigo[]
  dataEntrada?: Date
}

export function PenalCalculadora({ artigosSelecionados, dataEntrada = new Date() }: Props) {
  const calc = calcularPena(artigosSelecionados, dataEntrada)
  const vazio = artigosSelecionados.length === 0

  return (
    <div className="dce-panel border-gold-500/20 p-5">
      <p className="dce-section-title">
        <Gavel size={14} /> Calculadora do Código Penal
      </p>
      <h3 className="mt-1 font-display text-xl text-white">Resumo da Pena</h3>

      <div className="mt-4 space-y-3">
        <Linha
          icon={<Timer size={16} />}
          label="Tempo Total de Pena"
          valor={vazio ? '—' : mesesParaTexto(calc.tempoTotalMeses)}
          destaque
        />
        <Linha
          icon={<CalendarClock size={16} />}
          label="Previsão de Soltura"
          valor={vazio ? '—' : formatDateTime(calc.previsaoSoltura.toISOString())}
        />
        <Linha
          icon={<CircleDollarSign size={16} />}
          label="Multa Total"
          valor={vazio ? '—' : formatBRL(calc.valorMultaTotal)}
        />
        <Linha icon={<ShieldAlert size={16} />} label="Artigos Selecionados" valor={`${artigosSelecionados.length}`} />
      </div>

      <div className="mt-4 space-y-2">
        {calc.exigeTornozeleira ? (
          <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
            <AlertTriangle size={16} className="animate-pulse-alert" />
            Tornozeleira Eletrônica: <strong>SIM</strong> — artigo exige monitoramento.
          </div>
        ) : (
          <div className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-400">
            Tornozeleira Eletrônica: Não
          </div>
        )}

        {vazio ? (
          <div className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-400">
            Fiança: selecione artigos
          </div>
        ) : calc.permiteFianca ? (
          <div className="rounded-md border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-sm text-sky-300">
            Fiança <strong>Permitida</strong> · valor de {formatBRL(calc.valorFianca)}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            <AlertTriangle size={16} />
            Crime <strong>Inafiançável</strong> — um ou mais artigos bloqueiam a fiança.
          </div>
        )}
      </div>
    </div>
  )
}

function Linha({
  icon,
  label,
  valor,
  destaque,
}: {
  icon: React.ReactNode
  label: string
  valor: string
  destaque?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 last:border-0">
      <span className="flex items-center gap-2 text-sm text-slate-400">
        <span className="text-gold-400/80">{icon}</span>
        {label}
      </span>
      <span className={`text-right font-mono text-sm ${destaque ? 'font-display text-lg text-gold-300' : 'text-slate-100'}`}>
        {valor}
      </span>
    </div>
  )
}
