import { useCallback, useEffect, useState } from 'react'
import { BadgeCheck, Check, Clock, ShieldQuestion, UserCheck, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Field } from '@/components/ui/Field'
import { EmptyState, InlineError, Spinner } from '@/components/ui/Feedback'
import { StatusContaBadge } from '@/components/ui/Badges'
import { dceApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { PATENTES_NIVEL_1, PATENTES_NIVEL_2, PATENTES_NIVEL_3, type NivelAcesso, type Oficial } from '@/types'
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
  }

  const aprovar = async () => {
    if (!selecionado || !aprovador) return
    setProcessando(true)
    try {
      await dceApi.aprovarOficial(selecionado.id, { patente, nivelAcesso: nivel }, { id: aprovador.id, nome: aprovador.nome })
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
                  <h3 className="font-display text-lg text-white">{o.nome}</h3>
                  <p className="font-mono text-xs text-slate-400">ID {o.passaporte}</p>
                  <p className="text-xs text-slate-500">{o.email}</p>
                </div>
                <StatusContaBadge status={o.statusConta} />
              </div>
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock size={13} /> Solicitado em {formatDateTime(o.criadoEm)}
              </p>
              <div className="mt-auto flex gap-2 border-t border-white/5 pt-3">
                <button onClick={() => abrirAprovacao(o)} className="dce-btn-primary flex-1 !py-2 text-xs">
                  <Check size={15} /> Aprovar
                </button>
                <button onClick={() => recusar(o)} className="dce-btn-danger !py-2 text-xs">
                  <X size={15} /> Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        aberto={!!selecionado}
        onFechar={() => setSelecionado(null)}
        titulo="Aprovar Cadastro"
        subtitulo={selecionado ? `${selecionado.nome} · ID ${selecionado.passaporte}` : ''}
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
          <p className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-slate-400">
            Ao aprovar, a conta passa para <strong className="text-emerald-300">ATIVO</strong> e o oficial poderá
            autenticar-se imediatamente.
          </p>
        </div>
      </Modal>
    </div>
  )
}
