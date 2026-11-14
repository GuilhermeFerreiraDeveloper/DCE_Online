import { useCallback, useEffect, useState } from 'react'
import { BookOpen, Gavel, Pencil, Plus, Trash2 } from 'lucide-react'
import { ArtigoModal } from '@/components/codigo-penal/ArtigoModal'
import { Modal } from '@/components/ui/Modal'
import { EmptyState, InlineError, Spinner } from '@/components/ui/Feedback'
import { dceApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import type { CodigoPenalArtigo } from '@/types'
import { formatBRL, mesesParaTexto } from '@/utils/format'

export default function CodigoPenal() {
  const oficial = useAuthStore((s) => s.oficial)
  const podeEditar = oficial?.nivelAcesso === 1

  const [artigos, setArtigos] = useState<CodigoPenalArtigo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<CodigoPenalArtigo | null>(null)
  const [excluir, setExcluir] = useState<CodigoPenalArtigo | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      setArtigos(await dceApi.listarCodigoPenal())
    } catch {
      setErro('Não foi possível carregar o código penal.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const salvar = async (dados: Omit<CodigoPenalArtigo, 'id'>) => {
    if (!oficial) return
    if (editando) {
      await dceApi.atualizarArtigo(editando.id, dados, { id: oficial.id, nome: oficial.nome })
    } else {
      await dceApi.criarArtigo(dados, { id: oficial.id, nome: oficial.nome })
    }
    await carregar()
  }

  const confirmarExclusao = async () => {
    if (!excluir || !oficial) return
    await dceApi.excluirArtigo(excluir.id, { id: oficial.id, nome: oficial.nome })
    setExcluir(null)
    await carregar()
  }

  const termo = busca.trim().toLowerCase()
  const filtrados = artigos.filter(
    (a) => !termo || a.artigo.toLowerCase().includes(termo) || a.crime.toLowerCase().includes(termo),
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="dce-section-title">
            <BookOpen size={14} /> Legislação
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-white">Código Penal do Estado</h1>
          <p className="mt-1 text-sm text-slate-400">
            {artigos.length} artigos cadastrados. {podeEditar ? 'Você pode editar o código penal.' : 'Somente o Comando pode editar.'}
          </p>
        </div>
        {podeEditar && (
          <button
            onClick={() => {
              setEditando(null)
              setModalAberto(true)
            }}
            className="dce-btn-primary"
          >
            <Plus size={16} /> Novo Artigo
          </button>
        )}
      </header>

      <div className="dce-panel p-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="dce-input"
          placeholder="Buscar por artigo ou crime..."
        />
      </div>

      {erro && <InlineError>{erro}</InlineError>}

      {carregando ? (
        <Spinner label="Carregando artigos..." />
      ) : filtrados.length === 0 ? (
        <EmptyState titulo="Nenhum artigo encontrado" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((a) => (
            <div key={a.id} className="dce-panel flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-sm text-gold-300">{a.artigo}</span>
                {podeEditar && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditando(a)
                        setModalAberto(true)
                      }}
                      className="rounded p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                      aria-label="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setExcluir(a)}
                      className="rounded p-1.5 text-red-300 hover:bg-red-500/10"
                      aria-label="Excluir"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="mt-1 font-display text-lg leading-tight text-white">{a.crime}</h3>
              {a.descricao && <p className="mt-1 text-xs text-slate-400">{a.descricao}</p>}

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-xs">
                <span className="text-slate-500">
                  Pena: <span className="text-slate-200">{mesesParaTexto(a.tempoMeses)}</span>
                </span>
                <span className="text-slate-500">
                  Multa: <span className="text-slate-200">{formatBRL(a.valorMulta)}</span>
                </span>
                <span className="text-slate-500">
                  Fiança:{' '}
                  <span className={a.permiteFianca ? 'text-sky-300' : 'text-red-300'}>
                    {a.permiteFianca ? formatBRL(a.valorFianca) : 'Inafiançável'}
                  </span>
                </span>
                <span className="text-slate-500">
                  Tornozeleira: <span className={a.tornozeleira ? 'text-amber-300' : 'text-slate-400'}>{a.tornozeleira ? 'Sim' : 'Não'}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ArtigoModal
        aberto={modalAberto}
        artigo={editando}
        onFechar={() => setModalAberto(false)}
        onSalvar={salvar}
      />

      <Modal
        aberto={!!excluir}
        onFechar={() => setExcluir(null)}
        titulo="Excluir Artigo"
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
          Remover o artigo <strong className="text-gold-300">{excluir?.artigo}</strong> ({excluir?.crime}) do código
          penal? Fichas já registradas não serão alteradas.
        </p>
      </Modal>

      <p className="flex items-center gap-2 text-xs text-slate-500">
        <Gavel size={13} /> Alterações no código penal são registradas na auditoria do Comando.
      </p>
    </div>
  )
}
