import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpenCheck,
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
import type { FichaPublica } from '@/types'

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
          <span className="dce-tag stagger-1 mx-auto animate-fade-up border-gold-500/40 bg-gold-500/10 text-gold-300">
            <ShieldHalf size={13} /> Sistema Oficial de Custódia · GTA RP
          </span>
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
            <Link to="/cadastro" className="dce-btn-ghost">
              <UserPlus size={16} /> Solicitar Cadastro
            </Link>
          </div>
        </div>
      </section>

      {/* RESULTADO */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {erro && <InlineError>{erro}</InlineError>}
        {buscando && <Spinner label="Consultando banco de dados penitenciário..." />}
        {!buscando && ficha && <FichaPublicaCard ficha={ficha} passaporteBuscado={ultimo} />}
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

      <footer className="border-t border-white/5 bg-navy-900/50 px-4 py-6 text-center text-xs text-slate-500">
        <p className="font-display uppercase tracking-widest text-slate-400">Departamento de Custódia do Estado</p>
        <p className="mt-1">Sistema institucional fictício para uso em servidores de GTA RP · Acesso de oficiais restrito por patente.</p>
      </footer>
    </div>
  )
}
