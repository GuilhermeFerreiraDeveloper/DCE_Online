import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  BookOpenCheck,
  Download,
  FileCheck,
  FileSearch,
  Fingerprint,
  Gavel,
  Lock,
  ScanFace,
  ShieldHalf,
  Siren,
  UserPlus,
} from 'lucide-react'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { DemoBanner } from '@/components/layout/DemoBanner'
import { FichaPublicaCard } from '@/components/detento/FichaPublicaCard'
import { InlineError, Spinner } from '@/components/ui/Feedback'
import { dceApi } from '@/services/api'
import type { FichaPublica, Foragido } from '@/types'

const RECURSOS = [
  {
    icon: ScanFace,
    titulo: 'Ficha Completa',
    texto: 'Consulte antecedentes, artigos cometidos, penas e multas de qualquer cidadão em segundos.',
  },
  {
    icon: Gavel,
    titulo: 'Código Penal Integrado',
    texto: 'Calculadora que soma penas, multas, fiança e torna­zeleira automaticamente no registro.',
  },
  {
    icon: Siren,
    titulo: 'Regime Disciplinar',
    texto: 'Controle de solitária, periculosidade e linha do tempo de bom ou mau comportamento.',
  },
  {
    icon: Lock,
    titulo: 'Acesso por Patente',
    texto: 'Hierarquia com três níveis: Comando, Oficialidade e Praças, com aprovação de cadastros.',
  },
]

export default function Home() {
  const [passaporte, setPassaporte] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [ficha, setFicha] = useState<FichaPublica | null>(null)
  const [erro, setErro] = useState('')
  const [ultimo, setUltimo] = useState('')
  const [foragidos, setForagidos] = useState<Foragido[]>([])

  useEffect(() => {
    dceApi.foragidos().then(setForagidos).catch(console.error)
  }, [])

  const consultar = async (e: FormEvent) => {
    e.preventDefault()
    const valor = passaporte.trim()
    if (!valor) return
    setBuscando(true)
    setErro('')
    setFicha(null)
    try {
      const resultado = await dceApi.fichaPublica(valor)
      setFicha(resultado)
      setUltimo(valor)
    } catch {
      setErro('Não foi possível concluir a consulta. Tente novamente.')
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <DemoBanner />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/5 py-16 sm:py-24">
        <div className="dce-grid-bg absolute inset-0 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/50 via-navy-950/80 to-navy-950" />
        
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <div className="stagger-1 mx-auto mb-8 flex w-fit animate-fade-up items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/5 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold-400">
            <img src="/DCELOGO.png" alt="" className="h-4 w-4 object-contain" />
            Sistema Oficial de Custódia · GTA RP
          </div>

          <h1 className="stagger-2 animate-fade-up font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter text-white sm:text-8xl">
            Departamento de Custódia
            <span className="mt-2 block text-gold-400">do Estado</span>
          </h1>

          <p className="stagger-3 mx-auto mt-8 max-w-2xl animate-fade-up text-balance text-slate-400 sm:text-lg">
            Consulta pública de fichas criminais, gestão penitenciária e controle disciplinar. 
            Digite o Passaporte/ID para verificar os antecedentes de um cidadão.
          </p>

          {/* BUSCA ESTILIZADA */}
          <div className="stagger-4 mx-auto mt-12 max-w-2xl animate-fade-up">
            <form onSubmit={consultar} className="group relative flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-5 text-gold-500/40 transition-colors group-focus-within:text-gold-500">
                  <Fingerprint size={24} />
                </div>
                <input
                  type="text"
                  value={passaporte}
                  onChange={(e) => setPassaporte(e.target.value)}
                  placeholder="Digite o Passaporte / ID do cidadão"
                  className="h-16 w-full rounded-xl border border-white/10 bg-navy-900/50 pl-14 pr-6 text-lg text-white placeholder-slate-500 outline-none transition-all focus:border-gold-500/50 focus:bg-navy-900/80 focus:ring-4 focus:ring-gold-500/10"
                />
              </div>
              <button
                type="submit"
                disabled={buscando}
                className="flex h-16 items-center justify-center gap-3 rounded-xl bg-gold-500 px-8 font-display text-lg font-bold uppercase tracking-wider text-navy-950 transition-all hover:scale-[1.02] hover:bg-gold-400 active:scale-[0.98] disabled:opacity-50"
              >
                {buscando ? <Spinner size={24} /> : <FileSearch size={24} />}
                Consultar Ficha
              </button>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-medium">
              <Link to="/login" className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
                <Lock size={16} className="text-gold-500" />
                Entrar (Login de Oficiais)
              </Link>
              <Link to="/edital" className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
                <UserPlus size={16} className="text-gold-500" />
                Concurso / Edital DCE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTADO */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {erro && <InlineError>{erro}</InlineError>}
        {buscando && <Spinner label="Consultando banco de dados penitenciário..." />}
        {!buscando && ficha && (
          <div className="animate-fade-up">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-white">
                Resultado da Consulta
              </h3>
              <button
                onClick={() => setFicha(null)}
                className="text-xs text-slate-500 hover:text-white"
              >
                Limpar Busca
              </button>
            </div>
            <FichaPublicaCard ficha={ficha} />
            
            {/* BOTÃO DE CERTIDÃO NA HOME */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  window.print();
                }}
                className="dce-btn-secondary !px-8 !py-3"
              >
                <FileCheck size={18} className="mr-2 text-gold-500" />
                Emitir Certidão Oficial (Nada Consta / Histórico)
              </button>
            </div>
          </div>
        )}
        {!buscando && !ficha && !erro && (
          <p className="text-center text-sm text-slate-500">
            Os resultados da consulta aparecerão aqui. Nenhum dado pessoal é exposto sem consulta por ID.
          </p>
        )}
      </section>

      {/* RECURSOS */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="dce-section-title mb-6 justify-center">
          <BookOpenCheck size={15} /> Estrutura do Sistema
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RECURSOS.map((r) => (
            <div key={r.titulo} className="dce-panel p-5 transition hover:border-gold-500/30">
              <span className="grid h-11 w-11 place-items-center rounded-md border border-gold-500/30 bg-navy-950 text-gold-400">
                <r.icon size={20} />
              </span>
              <h3 className="mt-4 font-display text-lg text-white">{r.titulo}</h3>
              <p className="mt-2 text-sm text-slate-400">{r.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MAIS PROCURADOS */}
      {foragidos.length > 0 && (
        <section className="border-t border-white/5 bg-navy-950/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <span className="dce-tag border-red-500/30 bg-red-500/10 text-red-400">
                <AlertCircle size={13} /> Alerta de Segurança Máxima
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-wider text-white">
                Mais Procurados <span className="text-red-500">pelo DCE</span>
              </h2>
              <p className="mt-2 text-slate-400">Indivíduos com mandado de prisão ativo e alta periculosidade.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {foragidos.map((f) => (
                <div
                  key={f.id}
                  className="group relative overflow-hidden rounded-lg border border-white/5 bg-navy-900/50 p-4 transition-all hover:border-red-500/30"
                >
                  <div className="absolute right-2 top-2 z-10">
                    <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-lg">
                      Procurado
                    </span>
                  </div>

                  <div className="aspect-[3/4] overflow-hidden rounded bg-black/40">
                    {f.fotoUrl ? (
                      <img
                        src={f.fotoUrl}
                        alt={f.nome}
                        className="h-full w-full object-cover grayscale transition-all group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-700">
                        <ScanFace size={48} />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 text-center">
                    <h3 className="truncate font-display text-sm font-bold uppercase text-white">{f.nome}</h3>
                    <p className="mt-1 text-xs text-slate-500">Passaporte: {f.passaporte}</p>

                    {f.recompensa && (
                      <div className="mt-3 rounded border border-gold-500/20 bg-gold-500/5 py-1 text-xs font-bold text-gold-400">
                        RECOMPENSA: ${f.recompensa.toLocaleString()}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap justify-center gap-1">
                      {f.crimes.slice(0, 2).map((c, i) => (
                        <span key={i} className="rounded bg-navy-950 px-1.5 py-0.5 text-[9px] text-slate-400">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-white/5 bg-navy-900/50 px-4 py-6 text-center text-xs text-slate-500">
        <p className="font-display uppercase tracking-widest text-slate-400">Departamento de Custódia do Estado</p>
        <p className="mt-1">Sistema institucional fictício para uso em servidores de GTA RP · Acesso de oficiais restrito por patente.</p>
      </footer>
    </div>
  )
}
