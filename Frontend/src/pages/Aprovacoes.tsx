import { useCallback, useEffect, useState } from 'react'
import { BadgeCheck, Check, ShieldQuestion, UserCheck, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Field } from '@/components/ui/Field'
import { EmptyState, InlineError, Spinner } from '@/components/ui/Feedback'
import { dceApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { DEPARTAMENTOS, PATENTES_NIVEL_1, PATENTES_NIVEL_2, PATENTES_NIVEL_3, type NivelAcesso, type Oficial } from '@/types'
import { formatDateTime } from '@/utils/format'

function patentesPorNivel(nivel: NivelAcesso): readonly string[] {
  if (nivel === 1) return PATENTES_NIVEL_1
  if (nivel === 2) return PATENTES_NIVEL_2
  return PATENTES_NIVEL_3
}

export default function Aprovacoes() {
  const aprovador = useAuthStore((s) => s.oficial)
  const [pendentes, setPendentes] = useState<Oficial[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [selecionado, setSelecionado] = useState<Oficial | null>(null)
  const [nivel, setNivel] = useState<NivelAcesso>(3)
  const [patente, setPatente] = useState<string>(PATENTES_NIVEL_3[0])
  const [departamento, setDepartamento] = useState<string>(DEPARTAMENTOS[0])
  const [processando, setProcessando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      setPendentes(await dceApi.listarPendentes())
    } catch {
      setErro('Não foi possível carregar os cadastros pendentes.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  useEffect(() => {
    setPatente(patentesPorNivel(nivel)[0])
  }, [nivel])

  const abrirAprovacao = (o: Oficial) => {
    setSelecionado(o)
    setNivel(3)
    setPatente(PATENTES_NIVEL_3[0])
    setDepartamento(o.departamento || DEPARTAMENTOS[0])
  }

  const aprovar = async () => {
    if (!selecionado || !aprovador) return
    setProcessando(true)
    try {
      await dceApi.aprovarOficial(
        selecionado.id,
        { patente, nivelAcesso: nivel, departamento },
        { id: aprovador.id, nome: aprovador.nome },
      )
      setSelecionado(null)
      await carregar()
    } catch {
      setErro('Não foi possível aprovar o cadastro.')
    } finally {
      setProcessando(false)
    }
  }

  const recusar = async (o: Oficial) => {
    if (!aprovador) return
    await dceApi.recusarOficial(o.id, { id: aprovador.id, nome: aprovador.nome })
    await carregar()
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="dce-section-title">
          <UserCheck size={14} /> Comando / Staff
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-white">Aprovação de Cadastros</h1>
        <p className="mt-1 text-sm text-slate-400">
          Analise as solicitações de recrutamento e atribua patente e nível de acesso ao aprovar.
        </p>
      </header>

      {erro && <InlineError>{erro}</InlineError>}

      {carregando ? (
        <Spinner label="Carregando solicitações..." />
      ) : pendentes.length === 0 ? (
        <EmptyState
          titulo="Nenhuma solicitação pendente"
          descricao="Todos os cadastros foram analisados. Novas solicitações aparecerão aqui."
          icone={<BadgeCheck size={30} />}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {pendentes.map((o) => (
            <div key={o.id} className="dce-panel flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">{o.nome}</h3>
                  <p className="text-xs text-slate-500">ID: {o.passaporte} · Email: {o.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-gold-400">Divisão Pretendida</p>
                  <p className="text-xs font-bold text-white">{o.divisaoPretendida || 'Não informada'}</p>
                </div>
              </div>

              {o.respostasEdital && (
                <div className="mt-4 rounded bg-navy-950/50 p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Questionário de RP:</p>
                  <p className="text-xs italic text-slate-400 leading-relaxed line-clamp-3">"{o.respostasEdital}"</p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[10px]">
                <span className="text-slate-500">Solicitado em: {formatDateTime(o.criadoEm)}</span>
                <div className="flex gap-2">
                  <button onClick={() => recusar(o)} className="dce-btn-ghost !py-1 text-red-400 hover:!bg-red-500/10">
                    <X size={14} /> Recusar
                  </button>
                  <button onClick={() => abrirAprovacao(o)} className="dce-btn-primary !py-1">
                    <Check size={14} /> Analisar e Aprovar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        aberto={!!selecionado}
        onFechar={() => setSelecionado(null)}
        titulo="Confirmar Aprovação"
        subtitulo={selecionado?.nome}
        footer={
          <>
            <button onClick={() => setSelecionado(null)} className="dce-btn-ghost">
              Cancelar
            </button>
            <button onClick={aprovar} disabled={processando} className="dce-btn-primary">
              <ShieldQuestion size={16} /> {processando ? 'Aprovando...' : 'Confirmar Aprovação'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {selecionado?.respostasEdital && (
            <div className="mb-4 rounded border border-white/10 bg-navy-950 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase text-gold-400">Respostas do Edital</p>
              <p className="text-xs text-slate-300 whitespace-pre-wrap">{selecionado.respostasEdital}</p>
            </div>
          )}
          <Field label="Nível de Acesso">
            <select value={nivel} onChange={(e) => setNivel(Number(e.target.value) as NivelAcesso)} className="dce-input">
              <option value={3}>Nível 3 — Praças e Graduações</option>
              <option value={2}>Nível 2 — Oficialidade e Supervisão</option>
              <option value={1}>Nível 1 — Comando / Staff</option>
            </select>
          </Field>
          <Field label="Patente">
            <select value={patente} onChange={(e) => setPatente(e.target.value)} className="dce-input">
              {patentesPorNivel(nivel).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Departamento">
            <select value={departamento} onChange={(e) => setDepartamento(e.target.value)} className="dce-input">
              {DEPARTAMENTOS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <p className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-slate-400">
            Ao aprovar, a conta passa para <strong className="text-emerald-300">ATIVO</strong> e o oficial poderá
            autenticar-se imediatamente.
          </p>
        </div>
      </Modal>
    </div>
  )
}
