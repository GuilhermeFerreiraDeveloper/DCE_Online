import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Ban,
  CalendarClock,
  CircleDollarSign,
  FilePlus2,
  FileSearch,
  Fingerprint,
  Gavel,
  History,
  Pencil,
  Printer,
  ScrollText,
  Trash2,
  UserCog,
  UserRound,
} from 'lucide-react'
import {
  FiancaTag,
  PericulosidadeBadge,
  SolitariaTag,
  StatusPrisaoBadge,
  TornozeleiraTag,
} from '@/components/ui/Badges'
import { EmptyState, InlineError, Spinner } from '@/components/ui/Feedback'
import { Modal } from '@/components/ui/Modal'
import { RegistrarOcorrenciaModal } from '@/components/detento/RegistrarOcorrenciaModal'
import { BaixaModal } from '@/components/detento/BaixaModal'
import { EditarFichaModal } from '@/components/detento/EditarFichaModal'
import { DocumentoModal } from '@/components/detento/DocumentoModal'
import { TimelineDisciplinar } from '@/components/detento/TimelineDisciplinar'
import { dceApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import type { Detento, HistoricoComportamento, HistoricoFichas } from '@/types'
import { formatBRL, formatDateTime, iniciais, mesesParaTexto, tempoRestante } from '@/utils/format'

type Aba = 'ficha' | 'timeline' | 'historico'

export default function DetentoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const oficial = useAuthStore((s) => s.oficial)

  const [detento, setDetento] = useState<Detento | null>(null)
  const [historico, setHistorico] = useState<HistoricoComportamento[]>([])
  const [historicoFichas, setHistoricoFichas] = useState<HistoricoFichas | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [aba, setAba] = useState<Aba>('ficha')
  const [ocorrenciaAberta, setOcorrenciaAberta] = useState(false)
  const [baixaAberta, setBaixaAberta] = useState(false)
  const [editarAberta, setEditarAberta] = useState(false)
  const [excluirAberto, setExcluirAberto] = useState(false)
  const [docAberto, setDocAberto] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  const nivel = oficial?.nivelAcesso ?? 3
  const podeEditar = nivel <= 2
  const podeBaixa = nivel <= 2
  const podeExcluir = nivel === 1

  const carregar = useCallback(async () => {
    if (!id) return
    setCarregando(true)
    setErro('')
    try {
      const [d, h] = await Promise.all([dceApi.obterDetento(Number(id)), dceApi.obterHistorico(Number(id))])
      if (!d) {
        setErro('Detento não encontrado.')
        return
      }
      setDetento(d)
      setHistorico(h)
      const hist = await dceApi.historicoFichas(d.passaporteDetento)
      setHistoricoFichas(hist)
    } catch {
      setErro('Não foi possível carregar a ficha.')
    } finally {
      setCarregando(false)
    }
  }, [id])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const confirmarExclusao = async () => {
    if (!detento || !oficial) return
    setExcluindo(true)
    try {
      await dceApi.excluirDetento(detento.id, { id: oficial.id, nome: oficial.nome })
      navigate('/painel')
    } catch {
      setErro('Não foi possível excluir a ficha.')
      setExcluindo(false)
    }
  }

  if (carregando) return <Spinner label="Carregando ficha..." />
  if (erro && !detento)
    return (
      <div className="space-y-4">
        <InlineError>{erro}</InlineError>
        <Link to="/painel" className="dce-btn-secondary">
          <ArrowLeft size={16} /> Voltar ao Painel
        </Link>
      </div>
    )
  if (!detento) return null

  const restante = tempoRestante(detento.previsaoSoltura, detento.dataEntrada)

  return (
    <div className="space-y-6">
      <Link to="/painel" className="dce-btn-ghost !px-2 -ml-2">
        <ArrowLeft size={16} /> Voltar ao Painel
      </Link>

      {/* Cabeçalho */}
      <header className="dce-panel flex flex-col gap-5 p-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          {detento.fotoUrl ? (
            <img
              src={detento.fotoUrl}
              alt={`Mugshot de ${detento.nomeDetento}`}
              className="h-24 w-24 shrink-0 rounded-md border border-white/10 object-cover grayscale"
            />
          ) : (
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-md border border-white/10 bg-navy-950 font-display text-3xl text-gold-300">
              {iniciais(detento.nomeDetento)}
            </div>
          )}
          <div>
            <p className="dce-section-title">
              <ScrollText size={14} /> Ficha de Detento
            </p>
            <h1 className="mt-1 font-display text-3xl text-white">{detento.nomeDetento}</h1>
            <p className="font-mono text-sm text-slate-400">Passaporte/ID · {detento.passaporteDetento}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <StatusPrisaoBadge status={detento.statusPrisao} />
          {detento.nivelPericulosidade && <PericulosidadeBadge nivel={detento.nivelPericulosidade} />}
          {detento.exigeTornozeleira && <TornozeleiraTag />}
          {detento.emSolitaria && <SolitariaTag />}
          <FiancaTag permite={detento.permiteFianca} />
        </div>
      </header>

      {/* Ações */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setOcorrenciaAberta(true)} className="dce-btn-secondary">
          <Gavel size={16} /> Registrar Ocorrência
        </button>
        <button onClick={() => setDocAberto(true)} className="dce-btn-secondary">
          <Printer size={16} /> Gerar Documento
        </button>
        {podeEditar && (
          <button onClick={() => setEditarAberta(true)} className="dce-btn-secondary">
            <Pencil size={16} /> Editar Ficha
          </button>
        )}
        {/* DOCUMENTOS */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
          <button
            onClick={() => setModalDocumento({ tipo: 'CERTIDAO' })}
            className="dce-btn-secondary !px-4 !py-2 text-xs"
          >
            <FileCheck size={14} className="mr-2" />
            Emitir Certidão
          </button>
          <button
            onClick={() => setModalDocumento({ tipo: 'ALVARA' })}
            className="dce-btn-secondary !px-4 !py-2 text-xs"
            disabled={detento.statusPrisao !== 'EM_CUSTODIA'}
          >
            <Download size={14} className="mr-2" />
            Alvará de Soltura
          </button>
          <button
            onClick={() => setModalDocumento({ tipo: 'MANDADO' })}
            className="dce-btn-secondary !px-4 !py-2 text-xs"
            disabled={detento.statusPrisao !== 'FORAGIDO'}
          >
            <Gavel size={14} className="mr-2" />
            Mandado de Custódia
          </button>
        </div>

        {podeBaixa && detento.statusPrisao === 'EM_CUSTODIA' && (
          <button onClick={() => setBaixaAberta(true)} className="dce-btn-primary">
            <UserCog size={16} /> Dar Baixa / Soltura
          </button>
        )}
        {podeExcluir && (
          <button onClick={() => setExcluirAberto(true)} className="dce-btn-danger ml-auto">
            <Trash2 size={16} /> Excluir Ficha
          </button>
        )}
      </div>

      {/* Abas */}
      <div className="flex flex-wrap gap-1 border-b border-white/10">
        {(
          [
            { v: 'ficha', label: 'Ficha do Detento', icon: UserRound },
            { v: 'historico', label: `Histórico de Prisões (${historicoFichas?.totalFichas ?? 1})`, icon: History },
            { v: 'timeline', label: `Linha do Tempo (${historico.length})`, icon: ScrollText },
          ] as const
        ).map((t) => (
          <button
            key={t.v}
            onClick={() => setAba(t.v)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              aba === t.v ? 'border-gold-500 text-gold-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {aba === 'ficha' ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Indicador icon={<CalendarClock size={18} />} label="Tempo Restante" valor={restante.texto} destaque />
            <Indicador icon={<Gavel size={18} />} label="Pena Total" valor={mesesParaTexto(detento.tempoTotalMeses)} />
            <Indicador icon={<CircleDollarSign size={18} />} label="Multa Total" valor={formatBRL(detento.valorMultaTotal)} />
            <Indicador icon={<Ban size={18} />} label="Previsão de Soltura" valor={formatDateTime(detento.previsaoSoltura)} />
          </div>

          <section className="dce-panel p-5">
            <p className="dce-section-title mb-4">Dados do Registro</p>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Órgão / Policial Condutor" valor={detento.policialCondutor ?? '—'} />
              <Info label="Oficial do DCE Responsável" valor={detento.oficialRegistrouNome ?? '—'} />
              <Info label="Data de Entrada" valor={formatDateTime(detento.dataEntrada)} />
              <Info label="Status de Fiança" valor={detento.permiteFianca ? 'Permitida' : 'Inafiançável'} />
              <Info label="Tornozeleira Eletrônica" valor={detento.exigeTornozeleira ? 'Sim' : 'Não'} />
              <Info
                label="Regime Disciplinar"
                valor={detento.emSolitaria ? `Solitária — ${detento.motivoSolitaria ?? ''}` : 'Regime comum'}
              />
            </dl>
          </section>

          <section className="dce-panel overflow-hidden">
            <div className="border-b border-white/5 px-5 py-4">
              <p className="dce-section-title">Crimes Cometidos</p>
            </div>
            {detento.crimesCometidos.length === 0 ? (
              <div className="p-5">
                <EmptyState titulo="Nenhum artigo vinculado" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="dce-table">
                  <thead>
                    <tr>
                      <th>Artigo</th>
                      <th>Crime</th>
                      <th>Pena</th>
                      <th>Multa</th>
                      <th>Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detento.crimesCometidos.map((c) => (
                      <tr key={c.artigoId}>
                        <td className="font-mono text-gold-300">{c.artigo}</td>
                        <td>{c.crime}</td>
                        <td>{mesesParaTexto(c.tempoMeses)}</td>
                        <td>{formatBRL(c.valorMulta)}</td>
                        <td className="text-xs">
                          {c.tornozeleira && <span className="text-amber-400">Tornozeleira </span>}
                          {!c.permiteFianca && <span className="text-red-400">Inafiançável</span>}
                          {c.tornozeleira === false && c.permiteFianca && <span className="text-slate-500">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : aba === 'historico' ? (
        <HistoricoPrisoes historico={historicoFichas} idAtual={detento.id} />
      ) : (
        <section className="dce-panel p-5">
          <p className="dce-section-title mb-5">Linha do Tempo Disciplinar</p>
          <TimelineDisciplinar historico={historico} />
        </section>
      )}

      {/* Modais */}
      <RegistrarOcorrenciaModal
        detento={detento}
        aberto={ocorrenciaAberta}
        onFechar={() => setOcorrenciaAberta(false)}
        onSalvo={carregar}
        permitirRegimeDisciplinar={podeBaixa}
      />
      <EditarFichaModal
        detento={detento}
        aberto={editarAberta}
        onFechar={() => setEditarAberta(false)}
        onSalvo={carregar}
      />
      <BaixaModal detento={detento} aberto={baixaAberta} onFechar={() => setBaixaAberta(false)} onSalvo={carregar} />
      <DocumentoModal
        detento={detento}
        aberto={docAberto}
        onFechar={() => setDocAberto(false)}
        oficial={oficial}
      />

      <Modal
        aberto={excluirAberto}
        onFechar={() => setExcluirAberto(false)}
        titulo="Excluir Ficha"
        subtitulo={`${detento.nomeDetento} · ID ${detento.passaporteDetento}`}
        footer={
          <>
            <button onClick={() => setExcluirAberto(false)} className="dce-btn-ghost">
              Cancelar
            </button>
            <button onClick={confirmarExclusao} disabled={excluindo} className="dce-btn-danger">
              <Trash2 size={16} /> {excluindo ? 'Excluindo...' : 'Excluir Definitivamente'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          Esta ação é <strong className="text-red-300">irreversível</strong> e removerá o detento e todo o histórico
          disciplinar vinculado. Um registro será enviado à auditoria do Comando.
        </p>
      </Modal>
    </div>
  )
}

function Indicador({
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
    <div className="dce-panel p-4">
      <span className="text-gold-400/80">{icon}</span>
      <p className="mt-2 text-[0.68rem] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-0.5 font-display ${destaque ? 'text-xl text-gold-300' : 'text-base text-white'}`}>{valor}</p>
    </div>
  )
}

function Info({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-[0.68rem] uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-200">{valor}</dd>
    </div>
  )
}

function HistoricoPrisoes({ historico, idAtual }: { historico: HistoricoFichas | null; idAtual: number }) {
  if (!historico || historico.fichas.length === 0) {
    return (
      <section className="dce-panel p-8">
        <EmptyState titulo="Nenhuma ficha encontrada" descricao="Não há registros de prisão para este passaporte." />
      </section>
    )
  }

  const textoResumo = `${historico.totalFichas} ${historico.totalFichas === 1 ? 'vez preso' : 'vezes preso'}${
    historico.artigos.length > 0 ? ' por ' : ''
  }${historico.artigos.map((a) => `${a.artigo}${a.ocorrencias > 1 ? ` (${a.ocorrencias}x)` : ''}`).join(', ')}`

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <section className="dce-panel p-5">
        <p className="dce-section-title mb-3">Resumo do Detento</p>
        <p className="font-display text-lg text-gold-300">{textoResumo}</p>
        {historico.artigos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {historico.artigos.map((a) => (
              <span
                key={a.artigo}
                className="rounded-md border border-white/10 bg-navy-900/60 px-3 py-1.5 text-xs"
                title={a.crime}
              >
                <span className="font-mono text-gold-300">{a.artigo}</span>{' '}
                <span className="text-slate-400">
                  {a.ocorrencias}x · {a.crime}
                </span>
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-navy-950/40 p-3">
            <p className="text-[0.68rem] uppercase tracking-wider text-slate-500">Total de Prisões</p>
            <p className="mt-0.5 font-display text-xl text-white">{historico.totalFichas}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-navy-950/40 p-3">
            <p className="text-[0.68rem] uppercase tracking-wider text-slate-500">Pena Total Acumulada</p>
            <p className="mt-0.5 font-display text-xl text-white">{mesesParaTexto(historico.totalMesesPena)}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-navy-950/40 p-3">
            <p className="text-[0.68rem] uppercase tracking-wider text-slate-500">Multas Acumuladas</p>
            <p className="mt-0.5 font-display text-xl text-white">{formatBRL(historico.totalMultas)}</p>
          </div>
        </div>
      </section>

      {/* Lista de prisões */}
      <section className="dce-panel overflow-hidden">
        <div className="border-b border-white/5 px-5 py-4">
          <p className="dce-section-title">Registro de Prisões</p>
        </div>
        <div className="divide-y divide-white/5">
          {historico.fichas.map((f) => {
            const ehAtual = f.id === idAtual
            return (
              <div
                key={f.id}
                className={`flex flex-col gap-3 p-5 sm:flex-row sm:items-start ${
                  ehAtual ? 'bg-gold-500/5' : ''
                }`}
              >
                <div className="flex items-center gap-3 sm:w-40 sm:shrink-0">
                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border font-display text-sm ${
                      ehAtual
                        ? 'border-gold-500 bg-gold-500/10 text-gold-300'
                        : 'border-white/10 bg-navy-900/60 text-slate-300'
                    }`}
                  >
                    {f.numeroPrisioneiro}ª
                  </div>
                  <div className="sm:hidden">
                    <p className="font-display text-white">
                      {f.numeroPrisioneiro}ª Prisão
                      {ehAtual && <span className="ml-2 text-xs text-gold-400">· atual</span>}
                    </p>
                    <p className="text-xs text-slate-500">{formatDateTime(f.dataEntrada)}</p>
                  </div>
                </div>

                <div className="hidden sm:block sm:w-40 sm:shrink-0">
                  <p className="font-display text-white">
                    {f.numeroPrisioneiro}ª Prisão
                    {ehAtual && <span className="ml-2 text-xs text-gold-400">· atual</span>}
                  </p>
                  <p className="text-xs text-slate-500">{formatDateTime(f.dataEntrada)}</p>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPrisaoBadge status={f.statusPrisao} />
                    {f.exigeTornozeleira && <TornozeleiraTag />}
                    {!f.permiteFianca && <FiancaTag permite={false} />}
                  </div>
                  <p className="text-sm text-slate-300">
                    <span className="text-slate-500">Crimes:</span>{' '}
                    {f.crimes.length > 0 ? f.crimes.join(', ') : '—'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {f.artigos.length > 0 && (
                      <span className="font-mono text-gold-300/80">{f.artigos.join(', ')}</span>
                    )}
                  </p>
                </div>

                <div className="flex gap-4 text-xs text-slate-400 sm:flex-col sm:items-end sm:gap-1">
                  <span>
                    Pena: <span className="text-slate-200">{mesesParaTexto(f.tempoTotalMeses)}</span>
                  </span>
                  <span>
                    Multa: <span className="text-slate-200">{formatBRL(f.valorMultaTotal)}</span>
                  </span>
                  {f.policialCondutor && (
                    <span className="truncate sm:max-w-[180px]" title={f.policialCondutor}>
                      {f.policialCondutor}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
