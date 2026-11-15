import { useCallback, useEffect, useState } from 'react'
import { Lock, Pencil, ShieldHalf, Trash2, Unlock, Users } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Field } from '@/components/ui/Field'
import { EmptyState, InlineError, Spinner } from '@/components/ui/Feedback'
import { StatusContaBadge } from '@/components/ui/Badges'
import { dceApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { DEPARTAMENTOS, PATENTES_NIVEL_1, PATENTES_NIVEL_2, PATENTES_NIVEL_3, type NivelAcesso, type Oficial } from '@/types'
import { iniciais } from '@/utils/format'

function patentesPorNivel(nivel: NivelAcesso): readonly string[] {
  if (nivel === 1) return PATENTES_NIVEL_1
  if (nivel === 2) return PATENTES_NIVEL_2
  return PATENTES_NIVEL_3
}

const NIVEL_LABEL: Record<NivelAcesso, string> = {
  1: 'Comando',
  2: 'Oficialidade',
  3: 'Praças',
}

export default function Oficiais() {
  const autor = useAuthStore((s) => s.oficial)
  const [oficiais, setOficiais] = useState<Oficial[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [filtroDepto, setFiltroDepto] = useState('')
  const [editando, setEditando] = useState<Oficial | null>(null)
  const [nivel, setNivel] = useState<NivelAcesso>(3)
  const [patente, setPatente] = useState<string>('')
  const [excluir, setExcluir] = useState<Oficial | null>(null)
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      setOficiais(await dceApi.listarOficiais())
    } catch {
      setErro('Não foi possível carregar os oficiais.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  useEffect(() => {
    if (editando) {
      setNivel(editando.nivelAcesso)
      setPatente(editando.patente)
    }
  }, [editando])

  useEffect(() => {
    if (editando) setPatente(patentesPorNivel(nivel)[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivel])

  const salvar = async () => {
    if (!editando || !autor) return
    setSalvando(true)
    try {
      await dceApi.atualizarOficial(editando.id, { patente, nivelAcesso: nivel }, { id: autor.id, nome: autor.nome })
      setEditando(null)
      await carregar()
    } catch {
      setErro('Não foi possível atualizar o oficial.')
    } finally {
      setSalvando(false)
    }
  }

  const alternarBloqueio = async (o: Oficial) => {
    if (!autor) return
    const novo = o.statusConta === 'BLOQUEADO' ? 'ATIVO' : 'BLOQUEADO'
    await dceApi.atualizarOficial(o.id, { statusConta: novo }, { id: autor.id, nome: autor.nome })
    await carregar()
  }

  const confirmarExclusao = async () => {
    if (!excluir || !autor) return
    await dceApi.excluirOficial(excluir.id, { id: autor.id, nome: autor.nome })
    setExcluir(null)
    await carregar()
  }

  const termo = busca.trim().toLowerCase()
  const filtrados = oficiais.filter(
    (o) =>
      (!filtroDepto || o.departamento === filtroDepto) &&
      (!termo ||
        o.nome.toLowerCase().includes(termo) ||
        o.passaporte.includes(termo) ||
        o.email.toLowerCase().includes(termo)),
  )

  return (
    <div className="space-y-6">
      <header>
        <p className="dce-section-title">
          <Users size={14} /> Comando / Staff
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-white">Gestão de Oficiais</h1>
        <p className="mt-1 text-sm text-slate-400">
          {oficiais.length} oficiais no sistema. Promova, rebaixe, bloqueie ou remova cadastros.
        </p>
      </header>

      <div className="dce-panel grid gap-3 p-3 sm:grid-cols-2">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="dce-input"
          placeholder="Buscar por nome, passaporte ou e-mail..."
        />
        <select value={filtroDepto} onChange={(e) => setFiltroDepto(e.target.value)} className="dce-input">
          <option value="">Todos os departamentos</option>
          {DEPARTAMENTOS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {erro && <InlineError>{erro}</InlineError>}

      {carregando ? (
        <Spinner label="Carregando oficiais..." />
      ) : filtrados.length === 0 ? (
        <EmptyState titulo="Nenhum oficial encontrado" />
      ) : (
        <div className="dce-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="dce-table min-w-[880px]">
              <thead>
                <tr>
                  <th>Oficial</th>
                  <th>Passaporte</th>
                  <th>Patente</th>
                  <th>Departamento</th>
                  <th>Nível</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-md bg-navy-950 font-display text-xs text-gold-300">
                          {iniciais(o.nome)}
                        </span>
                        <div>
                          <p className="font-medium text-white">{o.nome}</p>
                          <p className="text-xs text-slate-500">{o.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-slate-300">{o.passaporte}</td>
                    <td className="text-slate-200">{o.patente}</td>
                    <td className="text-slate-300">{o.departamento}</td>
                    <td>
                      <span className="dce-tag border-white/10 bg-white/5 text-slate-300">
                        N{o.nivelAcesso} · {NIVEL_LABEL[o.nivelAcesso]}
                      </span>
                    </td>
                    <td>
                      <StatusContaBadge status={o.statusConta} />
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditando(o)}
                          className="rounded p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                          title="Editar patente/nível"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => alternarBloqueio(o)}
                          className="rounded p-2 text-amber-300 hover:bg-amber-500/10"
                          title={o.statusConta === 'BLOQUEADO' ? 'Desbloquear' : 'Bloquear'}
                        >
                          {o.statusConta === 'BLOQUEADO' ? <Unlock size={15} /> : <Lock size={15} />}
                        </button>
                        <button
                          onClick={() => setExcluir(o)}
                          className="rounded p-2 text-red-300 hover:bg-red-500/10"
                          title="Excluir oficial"
                          disabled={o.id === autor?.id}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        aberto={!!editando}
        onFechar={() => setEditando(null)}
        titulo="Editar Oficial"
        subtitulo={editando?.nome}
        footer={
          <>
            <button onClick={() => setEditando(null)} className="dce-btn-ghost">
              Cancelar
            </button>
            <button onClick={salvar} disabled={salvando} className="dce-btn-primary">
              <ShieldHalf size={16} /> {salvando ? 'Salvando...' : 'Salvar'}
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
        </div>
      </Modal>

      <Modal
        aberto={!!excluir}
        onFechar={() => setExcluir(null)}
        titulo="Excluir Oficial"
        footer={
          <>
            <button onClick={() => setExcluir(null)} className="dce-btn-ghost">
              Cancelar
            </button>
            <button onClick={confirmarExclusao} className="dce-btn-danger">
              <Trash2 size={16} /> Excluir
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          Remover definitivamente o cadastro de <strong className="text-gold-300">{excluir?.nome}</strong>? Esta ação será
          registrada na auditoria.
        </p>
      </Modal>
    </div>
  )
}
