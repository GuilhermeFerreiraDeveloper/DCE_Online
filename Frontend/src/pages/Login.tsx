import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { KeyRound, Lock, ShieldHalf, User } from 'lucide-react'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { DemoBanner } from '@/components/layout/DemoBanner'
import { Field } from '@/components/ui/Field'
import { InlineError } from '@/components/ui/Feedback'
import { useAuthStore } from '@/store/auth'

const CONTAS_DEMO = [
  { papel: 'Comando (Nível 1)', id: '1001', senha: 'dce12345', email: 'comando@dce.gov' },
  { papel: 'Supervisão (Nível 2)', id: '1002', senha: 'dce12345', email: 'supervisor@dce.gov' },
  { papel: 'Praças (Nível 3)', id: '1003', senha: 'dce12345', email: 'agente@dce.gov' },
]

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

  const usarDemo = (conta: (typeof CONTAS_DEMO)[number]) => {
    setIdentificador(conta.email)
    setSenha(conta.senha)
    setErro('')
  }

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <DemoBanner />

      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div className="hidden flex-col justify-center lg:flex">
          <span className="grid h-14 w-14 place-items-center rounded-lg border border-gold-500/40 bg-navy-900 text-gold-400">
            <ShieldHalf size={26} />
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold uppercase leading-tight text-white">
            Acesso Restrito
            <span className="block text-gold-400">de Oficiais</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm text-slate-400">
            Autenticação obrigatória para registro de detentos, controle disciplinar e administração do sistema.
            Acesso liberado apenas para contas aprovadas pelo Comando.
          </p>
        </div>

        <div className="dce-panel animate-fade-up border-gold-500/20 p-6 sm:p-8">
          <p className="dce-section-title">
            <KeyRound size={14} /> Login de Oficiais
          </p>
          <h2 className="mt-2 font-display text-2xl text-white">Identificação</h2>

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

          <div className="mt-6 rounded-md border border-white/10 bg-white/[0.02] p-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-slate-400">
              Contas de demonstração (senha: dce12345)
            </p>
            <div className="mt-2 grid gap-1.5">
              {CONTAS_DEMO.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => usarDemo(c)}
                  className="flex items-center justify-between rounded border border-white/5 bg-navy-950/60 px-3 py-2 text-left text-xs transition hover:border-gold-500/30"
                >
                  <span className="text-slate-300">{c.papel}</span>
                  <span className="font-mono text-gold-300">{c.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
