import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FilePlus2, Filter, RefreshCw, Search, ShieldAlert, ShieldCheck, UserX, MessageSquare, Bell } from 'lucide-react'
import { DetentoCard } from '@/components/detento/DetentoCard'
import { MuralTab } from '@/components/layout/MuralTab'
import { ChatTab } from '@/components/layout/ChatTab'
import { RegistrarOcorrenciaModal } from '@/components/detento/RegistrarOcorrenciaModal'
import { BaixaModal } from '@/components/detento/BaixaModal'
import { EmptyState, InlineError, Spinner } from '@/components/ui/Feedback'
import { dceApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import type { Detento, StatusPrisao } from '@/types'

type Filtro = 'TODOS' | StatusPrisao
type Tab = 'PRESOS' | 'MURAL' | 'CHAT'

const FILTROS: { valor: Filtro; label: string }[] = [
  { valor: 'TODOS', label: 'Todos' },
  { valor: 'EM_CUSTODIA', label: 'Em Custódia' },
  { valor: 'FORAGIDO', label: 'Foragidos' },
  { valor: 'LIBERADO', label: 'Liberados' },
]

export default function Dashboard() {
  const oficial = useAuthStore((s) => s.oficial)
  const [tab, setTab] = useState<Tab>('PRESOS')
  const [detentos, setDetentos] = useState<Detento[]>([])
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [ocorrencia, setOcorrencia] = useState<Detento | null>(null)
  const [baixa, setBaixa] = useState<Detento | null>(null)

  const podeBaixa = (oficial?.nivelAcesso ?? 3) <= 2

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      setDetentos(await dceApi.listarDetentos())
    } catch {
      setErro('Não foi possível carregar os detentos.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return detentos.filter((d) => {
      const casaFiltro = filtro === 'TODOS' || d.statusPrisao === filtro
      const casaBusca =
        !termo ||
        d.nomeDetento.toLowerCase().includes(termo) ||
        d.passaporteDetento.includes(termo)
      return casaFiltro && casaBusca
    })
  }, [detentos, busca, filtro])

  const contagem = useMemo(
    () => ({
      custodia: detentos.filter((d) => d.statusPrisao === 'EM_CUSTODIA').length,
      foragidos: detentos.filter((d) => d.statusPrisao === 'FORAGIDO').length,
      liberados: detentos.filter((d) => d.statusPrisao === 'LIBERADO').length,
    }),
    [detentos],
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="dce-section-title">
            <ShieldAlert size={14} /> Painel Operacional
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-white">
            {tab === 'PRESOS' ? 'Gestão de Presos' : tab === 'MURAL' ? 'Mural do Comando' : 'Chat do Plantão'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Bem-vindo, {oficial?.nome}. {tab === 'PRESOS' ? `${detentos.length} fichas registradas no sistema.` : 'Comunicações internas em tempo real.'}
          </p>
        </div>
        <div className="flex gap-2">
          {tab === 'PRESOS' && (
            <>
              <button onClick={() => void carregar()} className="dce-btn-secondary" title="Recarregar">
                <RefreshCw size={16} className={carregando ? 'animate-spin' : ''} />
              </button>
              <Link to="/painel/novo" className="dce-btn-primary">
                <FilePlus2 size={16} /> Nova Ficha
              </Link>
            </>
          )}
        </div>
      </header>

      {/* TABS NAVIGATION */}
      <div className="flex gap-1 border-b border-white/5">
        <button
          onClick={() => setTab('PRESOS')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-bold uppercase transition ${
            tab === 'PRESOS' ? 'border-gold-500 text-gold-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <ShieldAlert size={14} /> Fichas Criminais
        </button>
        <button
          onClick={() => setTab('MURAL')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-bold uppercase transition ${
            tab === 'MURAL' ? 'border-gold-500 text-gold-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Bell size={14} /> Mural de Avisos
        </button>
        <button
          onClick={() => setTab('CHAT')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-bold uppercase transition ${
            tab === 'CHAT' ? 'border-gold-500 text-gold-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <MessageSquare size={14} /> Chat do Plantão
        </button>
      </div>

      {tab === 'PRESOS' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Em Custódia', valor: contagem.custodia, icon: ShieldAlert, cls: 'text-red-300' },
              { label: 'Foragidos', valor: contagem.foragidos, icon: UserX, cls: 'text-orange-300' },
              { label: 'Liberados', valor: contagem.liberados, icon: ShieldCheck, cls: 'text-emerald-300' },
            ].map((c) => (
              <div key={c.label} className="dce-panel flex items-center gap-3 p-3 sm:p-4">
                <c.icon size={20} className={c.cls} />
                <div>
                  <p className="font-display text-2xl leading-none text-white">{c.valor}</p>
                  <p className="text-[0.68rem] uppercase tracking-wider text-slate-500">{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="dce-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="dce-input pl-9"
                placeholder="Filtrar por Nome ou Passaporte..."
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={15} className="text-slate-500" />
              {FILTROS.map((f) => (
                <button
                  key={f.valor}
                  onClick={() => setFiltro(f.valor)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                    filtro === f.valor
                      ? 'border-gold-500/50 bg-gold-500/15 text-gold-200'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {erro && <InlineError>{erro}</InlineError>}

          {carregando ? (
            <Spinner label="Carregando fichas..." />
          ) : filtrados.length === 0 ? (
            <EmptyState
              titulo="Nenhum detento encontrado"
              descricao="Ajuste os filtros de busca ou registre uma nova entrada no sistema."
              acao={
                <Link to="/painel/novo" className="dce-btn-primary mt-2">
                  <FilePlus2 size={16} /> Registrar Nova Entrada
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtrados.map((d) => (
                <DetentoCard
                  key={d.id}
                  detento={d}
                  podeBaixa={podeBaixa}
                  onOcorrencia={setOcorrencia}
                  onBaixa={setBaixa}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'MURAL' && <MuralTab />}
      {tab === 'CHAT' && <ChatTab />}

      <RegistrarOcorrenciaModal
        detento={ocorrencia}
        aberto={!!ocorrencia}
        onFechar={() => setOcorrencia(null)}
        onSalvo={carregar}
      />
      <BaixaModal detento={baixa} aberto={!!baixa} onFechar={() => setBaixa(null)} onSalvo={carregar} />
    </div>
  )
}
