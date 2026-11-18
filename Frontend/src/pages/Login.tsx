import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { KeyRound, Lock, ShieldHalf, User } from 'lucide-react'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { DemoBanner } from '@/components/layout/DemoBanner'
import { Field } from '@/components/ui/Field'
import { InlineError } from '@/components/ui/Feedback'
import { useAuthStore } from '@/store/auth'

export default function Login() {
  const [identificador, setIdentificador] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const login = useAuthStore((s) => s.login)
  const carregando = useAuthStore((s) => s.carregando)
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as { from?: string } | null)?.from ?? '/painel'

  const submeter = async (e: FormEvent) => {
    e.preventDefault()
    setErro('')
    try {
      await login(identificador.trim(), senha)
      navigate(destino, { replace: true })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao autenticar.')
    }
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <PublicHeader />
      <DemoBanner />

      <main className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="hidden flex-col justify-center lg:flex">
          <div className="stagger-1 animate-fade-up">
            <Link to="/" className="group flex w-fit items-center gap-4 transition-all duration-300 hover:scale-105">
              <img 
                src="/DCELOGO.png" 
                alt="DCE Logo" 
                className="h-20 w-20 object-contain transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
              />
              <div className="h-16 w-px bg-white/10" />
              <div>
                <span className="block font-display text-2xl font-bold uppercase tracking-tight text-white">
                  Acesso Restrito
                </span>
                <span className="block text-sm font-bold uppercase tracking-[0.3em] text-gold-400">
                  Departamento de Custódia
                </span>
              </div>
            </Link>
          </div>
          
          <h2 className="stagger-2 mt-12 animate-fade-up font-display text-5xl font-extrabold uppercase leading-tight text-white">
            Identificação de 
            <span className="block text-gold-500">Oficiais do Estado</span>
          </h2>
          
          <p className="stagger-3 mt-6 max-w-md animate-fade-up text-lg text-slate-400">
            Autenticação obrigatória para registro de detentos, controle disciplinar e administração do sistema penitenciário.
          </p>

          <div className="stagger-4 mt-10 flex animate-fade-up items-center gap-6 text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldHalf className="text-gold-500/50" size={20} />
              <span className="text-xs uppercase tracking-widest font-bold">Protocolo Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="text-gold-500/50" size={20} />
              <span className="text-xs uppercase tracking-widest font-bold">Dados Criptografados</span>
            </div>
          </div>
        </div>

        <div className="stagger-2 flex items-center justify-center animate-fade-up lg:justify-end">
          <div className="w-full max-w-md rounded-2xl border border-white/5 bg-navy-900/40 p-8 backdrop-blur-xl sm:p-10">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/">
                <img src="/DCELOGO.png" alt="DCE Logo" className="h-12 w-12 object-contain" />
              </Link>
              <div className="text-right">
                <span className="block font-display text-lg font-bold uppercase text-white">Login</span>
                <span className="block text-[0.6rem] uppercase tracking-widest text-gold-500">DCE · GTA RP</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 text-gold-500">
                <KeyRound size={16} />
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em]">Login de Oficiais</span>
              </div>
              <h3 className="mt-1 font-display text-3xl font-bold text-white">Identificação</h3>
            </div>

            <form onSubmit={submeter} className="mt-6 space-y-4">
              {erro && <InlineError>{erro}</InlineError>}
              <Field label="E-mail ou Passaporte">
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    className="dce-input pl-9"
                    placeholder="oficial@dce.gov ou 1001"
                    autoComplete="username"
                    required
                  />
                </div>
              </Field>
              <Field label="Senha">
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="dce-input pl-9"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </Field>
              <button type="submit" disabled={carregando} className="dce-btn-primary w-full">
                {carregando ? 'Autenticando...' : 'Entrar no Sistema'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-400">
              Ainda não é oficial?{' '}
              <Link to="/cadastro" className="font-semibold text-gold-400 hover:text-gold-300">
                Solicitar cadastro
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
