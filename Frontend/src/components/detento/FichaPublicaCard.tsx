import { CircleDot, ScanFace, ShieldCheck, ShieldX } from 'lucide-react'
import type { FichaPublica } from '@/types'
import { PericulosidadeBadge, SolitariaTag } from '@/components/ui/Badges'
import { formatBRL, formatDateTime, iniciais, mesesParaTexto } from '@/utils/format'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  EM_CUSTODIA: { label: 'Atualmente Preso', cls: 'border-red-500/40 bg-red-500/10 text-red-300' },
  LIBERADO: { label: 'Em Liberdade', cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  FORAGIDO: { label: 'Foragido', cls: 'border-orange-500/40 bg-orange-500/10 text-orange-300' },
  TORNOZELEIRA: {
    label: 'Uso de Tornozeleira Eletrônica',
    cls: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  },
}

interface Props {
  ficha: FichaPublica
  passaporteBuscado: string
}

export function FichaPublicaCard({ ficha, passaporteBuscado }: Props) {
  if (!ficha.encontrado) {
    return (
      <div className="dce-panel animate-fade-up p-6 text-center sm:p-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          <ShieldCheck size={26} />
        </div>
        <h3 className="mt-4 font-display text-xl text-white">Antecedentes Limpos</h3>
        <p className="mt-2 text-sm text-slate-400">
          Nenhuma ficha penal encontrada para o ID{' '}
          <span className="font-mono text-slate-200">{passaporteBuscado}</span>. Cidadão com antecedentes limpos.
        </p>
      </div>
    )
  }

  const status = STATUS_MAP[ficha.statusAtual ?? 'LIBERADO']

  return (
    <div className="dce-panel animate-fade-up overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/5 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          {ficha.fotoUrl ? (
            <img
              src={ficha.fotoUrl}
              alt={`Mugshot de ${ficha.nome}`}
              className="h-20 w-20 shrink-0 rounded-md border border-white/10 object-cover grayscale"
            />
          ) : (
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-md border border-white/10 bg-navy-950 font-display text-2xl text-gold-300">
              {iniciais(ficha.nome ?? '??')}
            </div>
          )}
          <div className="min-w-0">
            <p className="dce-section-title">
              <ScanFace size={14} /> Ficha Criminal
            </p>
            <h3 className="mt-1 truncate font-display text-2xl text-white">{ficha.nome}</h3>
            <p className="font-mono text-sm text-slate-400">Passaporte/ID · {ficha.passaporte}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <span className={`dce-tag ${status.cls}`}>
            {ficha.statusAtual === 'TORNOZELEIRA' ? <CircleDot size={13} /> : <ShieldX size={13} />}
            {status.label}
          </span>
          {ficha.nivelPericulosidade && <PericulosidadeBadge nivel={ficha.nivelPericulosidade} />}
          {ficha.emSolitaria && <SolitariaTag />}
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-white/5 border-b border-white/5">
        <div className="px-5 py-4">
          <p className="text-[0.68rem] uppercase tracking-wider text-slate-500">Pena Total</p>
          <p className="mt-1 font-display text-lg text-white">{mesesParaTexto(ficha.totalMeses ?? 0)}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[0.68rem] uppercase tracking-wider text-slate-500">Multas Acumuladas</p>
          <p className="mt-1 font-display text-lg text-white">{formatBRL(ficha.totalMulta ?? 0)}</p>
        </div>
      </div>

      <div className="p-5">
        <p className="dce-section-title mb-3">Histórico de Passagens</p>
        <div className="overflow-x-auto">
          <table className="dce-table">
            <thead>
              <tr>
                <th>Artigo</th>
                <th>Crime</th>
                <th>Pena</th>
                <th>Multa</th>
                <th>Entrada</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(ficha.passagens ?? []).map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-gold-300">{p.artigo}</td>
                  <td>{p.crime}</td>
                  <td>{mesesParaTexto(p.tempoMeses)}</td>
                  <td>{formatBRL(p.multa)}</td>
                  <td className="whitespace-nowrap text-slate-400">{formatDateTime(p.dataEntrada)}</td>
                  <td>
                    {p.statusPrisao === 'LIBERADO' ? (
                      <span className="text-emerald-300">Liberado</span>
                    ) : p.statusPrisao === 'FORAGIDO' ? (
                      <span className="text-orange-300">Foragido</span>
                    ) : (
                      <span className="text-red-300">Em Custódia</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
