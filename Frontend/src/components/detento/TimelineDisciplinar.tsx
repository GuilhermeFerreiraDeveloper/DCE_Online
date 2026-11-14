import { Ban, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { HistoricoComportamento } from '@/types'
import { EmptyState } from '@/components/ui/Feedback'
import { PericulosidadeBadge } from '@/components/ui/Badges'
import { formatDateTime } from '@/utils/format'

const CONFIG: Record<
  HistoricoComportamento['tipoRegistro'],
  { label: string; icon: typeof ThumbsUp; cls: string; dot: string }
> = {
  BOM_COMPORTAMENTO: { label: 'Bom Comportamento', icon: ThumbsUp, cls: 'text-emerald-300', dot: 'bg-emerald-400' },
  MAU_COMPORTAMENTO: { label: 'Mau Comportamento', icon: ThumbsDown, cls: 'text-red-300', dot: 'bg-red-400' },
  SOLITARIA: { label: 'Regime Disciplinar (Solitária)', icon: Ban, cls: 'text-fuchsia-300', dot: 'bg-fuchsia-400' },
}

export function TimelineDisciplinar({ historico }: { historico: HistoricoComportamento[] }) {
  if (historico.length === 0) {
    return (
      <EmptyState
        titulo="Sem registros disciplinares"
        descricao="Ainda não há ocorrências, elogios ou punições registrados para este detento."
      />
    )
  }

  return (
    <ol className="relative space-y-4 border-l border-white/10 pl-6">
      {historico.map((h) => {
        const cfg = CONFIG[h.tipoRegistro]
        const Icon = cfg.icon
        return (
          <li key={h.id} className="relative animate-fade-up">
            <span className={`absolute -left-[1.72rem] top-1.5 h-3 w-3 rounded-full ring-4 ring-navy-950 ${cfg.dot}`} />
            <div className="dce-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-2 text-sm font-semibold ${cfg.cls}`}>
                  <Icon size={15} /> {cfg.label}
                </span>
                <span className="text-xs text-slate-500">{formatDateTime(h.criadoEm)}</span>
              </div>

              {h.nivelPericulosidade && (
                <div className="mt-2">
                  <PericulosidadeBadge nivel={h.nivelPericulosidade} />
                </div>
              )}

              {h.descricao && <p className="mt-2 text-sm text-slate-300">{h.descricao}</p>}

              {h.emSolitaria && h.motivoSolitaria && (
                <div className="mt-2 rounded-md border border-fuchsia-500/25 bg-fuchsia-500/5 px-3 py-2 text-xs">
                  <p className="text-fuchsia-300">
                    <strong>Motivo:</strong> {h.motivoSolitaria}
                  </p>
                  {h.terminoSolitaria && (
                    <p className="mt-1 text-slate-400">Término do isolamento: {formatDateTime(h.terminoSolitaria)}</p>
                  )}
                </div>
              )}

              <p className="mt-2 text-[0.7rem] uppercase tracking-wider text-slate-500">
                Registrado por {h.oficialResponsavelNome ?? 'Oficial'}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
