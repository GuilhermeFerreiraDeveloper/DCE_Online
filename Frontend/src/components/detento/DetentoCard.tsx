import { Link } from 'react-router-dom'
import { CalendarClock, Eye, Gavel, MessageSquarePlus } from 'lucide-react'
import type { Detento } from '@/types'
import {
  PericulosidadeBadge,
  SolitariaTag,
  StatusPrisaoBadge,
  TornozeleiraTag,
} from '@/components/ui/Badges'
import { formatBRL, formatDate, iniciais, mesesParaTexto, tempoRestante } from '@/utils/format'

interface Props {
  detento: Detento
  onOcorrencia: (d: Detento) => void
  onBaixa: (d: Detento) => void
  podeBaixa: boolean
}

export function DetentoCard({ detento, onOcorrencia, onBaixa, podeBaixa }: Props) {
  const restante = tempoRestante(detento.previsaoSoltura, detento.dataEntrada)
  const privado = detento.statusPrisao !== 'EM_CUSTODIA'

  return (
    <div className="dce-panel flex flex-col gap-4 p-4 transition hover:border-gold-500/25">
      <div className="flex items-start gap-3">
        {detento.fotoUrl ? (
          <img
            src={detento.fotoUrl}
            alt={`Mugshot de ${detento.nomeDetento}`}
            className="h-16 w-16 shrink-0 rounded-md border border-white/10 object-cover grayscale"
          />
        ) : (
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md border border-white/10 bg-navy-950 font-display text-xl text-gold-300">
            {iniciais(detento.nomeDetento)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-lg leading-tight text-white">{detento.nomeDetento}</h3>
          <p className="font-mono text-xs text-slate-400">ID {detento.passaporteDetento}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusPrisaoBadge status={detento.statusPrisao} />
            {detento.nivelPericulosidade && <PericulosidadeBadge nivel={detento.nivelPericulosidade} />}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {detento.exigeTornozeleira && <TornozeleiraTag />}
        {detento.emSolitaria && <SolitariaTag />}
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock size={13} />
            {privado ? 'Registro encerrado' : `Resta ${restante.texto}`}
          </span>
          <span className="font-mono">{mesesParaTexto(detento.tempoTotalMeses)}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${privado ? 'bg-slate-500' : 'bg-gold-500'}`}
            style={{ width: `${privado ? 100 : restante.percentualDecorrido}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[0.7rem] text-slate-500">
          <span>Soltura prevista: {formatDate(detento.previsaoSoltura)}</span>
          <span className="text-slate-400">{formatBRL(detento.valorMultaTotal)}</span>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-white/5 pt-3">
        <Link to={`/painel/detento/${detento.id}`} className="dce-btn-secondary flex-1 !py-2 text-xs">
          <Eye size={15} /> Ver Ficha
        </Link>
        <button onClick={() => onOcorrencia(detento)} className="dce-btn-ghost !py-2 text-xs" title="Registrar ocorrência">
          <MessageSquarePlus size={15} />
        </button>
        {podeBaixa && !privado && (
          <button onClick={() => onBaixa(detento)} className="dce-btn-ghost !py-2 text-xs" title="Dar baixa / soltura">
            <Gavel size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
