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
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="dce-grid-bg absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-950/40 to-navy-950" />
        <div className="relative mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <Link to="/" className="dce-tag group stagger-1 mx-auto animate-fade-up border-gold-500/40 bg-gold-500/10 text-gold-300 transition-all duration-300 hover:scale-105">
            <img 
              src="/DCELOGO.png" 
              alt="DCE Logo" 
              className="h-4 w-4 object-contain transition-transform duration-300 group-hover:scale-125" 
            />
            Sistema Oficial de Custódia · GTA RP
          </Link>
          <h1 className="stagger-2 mt-6 animate-fade-up text-balance font-display text-4xl font-bold uppercase leading-tight tracking-wide text-white sm:text-6xl">
            Departamento de Custódia
            <span className="block text-gold-400">do Estado</span>
          </h1>
          <p className="stagger-3 mx-auto mt-5 max-w-2xl animate-fade-up text-balance text-sm text-slate-400 sm:text-base">
            Consulta pública de fichas criminais, gestão penitenciária e controle disciplinar. Digite o Passaporte/ID
            para verificar os antecedentes de um cidadão.
          </p>

          {/* BARRA DE CONSULTA */}
          <form
            onSubmit={consultar}
            className="stagger-4 mx-auto mt-8 flex w-full max-w-2xl animate-fade-up flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Fingerprint size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400/80" />
              <input
                value={passaporte}
                onChange={(e) => setPassaporte(e.target.value)}
                inputMode="numeric"
                placeholder="Digite o Passaporte / ID do cidadão"
                aria-label="Passaporte ou ID do cidadão"
                className="dce-input !py-3.5 pl-10 font-mono text-base"
              />
            </div>
            <button type="submit" disabled={buscando} className="dce-btn-primary !px-6 !py-3.5">
              <FileSearch size={18} />
              {buscando ? 'Consultando' : 'Consultar Ficha'}
            </button>
          </form>

          <div className="stagger-5 mt-5 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/login" className="dce-btn-secondary">
              <Lock size={16} /> Entrar (Login de Oficiais)
            </Link>
            <Link to="/edital" className="dce-btn-ghost">
              <UserPlus size={16} /> Concurso / Edital DCE
            </Link>
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
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded bg-gold-600 px-3 py-1.5 text-xs font-bold uppercase text-navy-950 transition-colors hover:bg-gold-500"
              >
                <Download size={14} /> Emitir Certidão Oficial
              </button>
            </div>
            <FichaPublicaCard ficha={ficha} passaporteBuscado={ultimo} />
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
