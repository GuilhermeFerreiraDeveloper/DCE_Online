import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AtSign, BadgeCheck, Fingerprint, Lock, UserPlus } from 'lucide-react'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { DemoBanner } from '@/components/layout/DemoBanner'
import { Field } from '@/components/ui/Field'
import { InlineError, InlineSuccess } from '@/components/ui/Feedback'
import { dceApi } from '@/services/api'

export default function Cadastro() {
  const [form, setForm] = useState({ passaporte: '', nome: '', email: '', senha: '', confirmar: '' })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const set = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }))

  const submeter = async (e: FormEvent) => {
    e.preventDefault()
    setErro('')
    if (form.senha.length < 6) return setErro('A senha deve ter no mínimo 6 caracteres.')
    if (form.senha !== form.confirmar) return setErro('As senhas informadas não coincidem.')
    setEnviando(true)
    try {
      await dceApi.register({
        passaporte: form.passaporte,
        nome: form.nome,
        email: form.email,
        senha: form.senha,
      })
      setSucesso(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível enviar a solicitação.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <DemoBanner />

      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="dce-panel animate-fade-up border-gold-500/20 p-6 sm:p-8">
          <p className="dce-section-title">
            <UserPlus size={14} /> Recrutamento
          </p>
          <h1 className="mt-2 font-display text-2xl text-white">Solicitação de Cadastro</h1>
          <p className="mt-2 text-sm text-slate-400">
            Preencha seus dados de RP. Sua conta ficará com status <strong className="text-gold-300">PENDENTE</strong> até
            a aprovação do Comando, que definirá sua patente e nível de acesso.
          </p>

          {sucesso ? (
            <div className="mt-6 space-y-4">
              <InlineSuccess>
                Solicitação enviada com sucesso! Aguarde a análise do Comando do DCE. Você será notificado quando sua
                conta for aprovada.
              </InlineSuccess>
              <Link to="/login" className="dce-btn-secondary w-full">
                Ir para o Login
              </Link>
            </div>
          ) : (
            <form onSubmit={submeter} className="mt-6 space-y-4">
              {erro && <InlineError>{erro}</InlineError>}

              <Field label="Passaporte / ID">
                <div className="relative">
                  <Fingerprint size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={form.passaporte}
                    onChange={set('passaporte')}
                    className="dce-input pl-9 font-mono"
                    placeholder="Ex.: 1042"
                    inputMode="numeric"
                    required
                  />
                </div>
              </Field>

              <Field label="Nome Completo (RP)">
                <div className="relative">
                  <BadgeCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={form.nome}
                    onChange={set('nome')}
                    className="dce-input pl-9"
                    placeholder="Nome e sobrenome do personagem"
                    required
                  />
                </div>
              </Field>

              <Field label="E-mail">
                <div className="relative">
                  <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    className="dce-input pl-9"
                    placeholder="oficial@dce.gov"
                    required
                  />
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Senha">
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      value={form.senha}
                      onChange={set('senha')}
                      className="dce-input pl-9"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </div>
                </Field>
                <Field label="Confirmar Senha">
                  <input
                    type="password"
                    value={form.confirmar}
                    onChange={set('confirmar')}
                    className="dce-input"
                    placeholder="Repita a senha"
                    required
                  />
                </Field>
              </div>

              <button type="submit" disabled={enviando} className="dce-btn-primary w-full">
                {enviando ? 'Enviando solicitação...' : 'Enviar Solicitação de Cadastro'}
              </button>

              <p className="text-center text-sm text-slate-400">
                Já possui cadastro?{' '}
                <Link to="/login" className="font-semibold text-gold-400 hover:text-gold-300">
                  Entrar
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
