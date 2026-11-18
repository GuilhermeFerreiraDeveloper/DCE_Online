import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  ShieldCheck, 
  ChevronRight, 
  BookOpen, 
  Users, 
  FileText,
  Send,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { dceApi } from '@/services/api'
import { InlineError, InlineSuccess } from '@/components/ui/Feedback'

const DIVISOES = [
  { id: 'ESCOLTA', nome: 'Escolta Tática', desc: 'Transporte de detentos de alta periculosidade e apoio em operações externas.' },
  { id: 'INTELIGENCIA', nome: 'Inteligência Penitenciária', desc: 'Investigação de facções, monitoramento de comunicações e prevenção de motins.' },
  { id: 'ACADEMIA', nome: 'Academia DCE', desc: 'Formação de novos recrutas e treinamento contínuo da tropa.' },
  { id: 'CUSTODIA', nome: 'Custódia Operacional', desc: 'Manutenção da ordem interna, triagem e gestão das celas.' }
]

export default function Edital() {
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState<'INFO' | 'FORM'>('INFO')
  const [enviando, setEnviando] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const [form, setForm] = useState({
    passaporte: '',
    nome: '',
    email: '',
    senha: '',
    divisaoPretendida: 'CUSTODIA',
    respostasEdital: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setFeedback(null)

    try {
      await dceApi.recrutamento(form)
      setFeedback({ type: 'success', message: 'Candidatura enviada com sucesso! O Comando analisará seu perfil.' })
      setTimeout(() => navigate('/'), 3000)
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao enviar candidatura.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      <PublicHeader />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-gold-400">
          <ArrowLeft size={16} /> Voltar para Home
        </Link>

        {etapa === 'INFO' ? (
          <div className="animate-fade-up">
            <header className="mb-12 text-center">
              <span className="dce-tag border-gold-500/30 bg-gold-500/10 text-gold-400">
                <ShieldCheck size={14} /> Edital de Concurso Público 2026
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
                Ingresso no <span className="text-gold-400">DCE</span>
              </h1>
              <p className="mt-4 text-lg text-slate-400">
                O Departamento de Custódia do Estado busca profissionais comprometidos com a ordem e a segurança penitenciária.
              </p>
            </header>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="dce-panel p-6">
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-white">
                  <BookOpen size={20} className="text-gold-400" /> Nossa História
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Fundado para centralizar a gestão de custódia, o DCE tornou-se a referência máxima em inteligência e escolta tática. Nossa missão é garantir que a lei seja cumprida dentro e fora dos muros, mantendo a integridade do sistema prisional do Estado.
                </p>
              </div>

              <div className="dce-panel p-6">
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-white">
                  <AlertTriangle size={20} className="text-amber-500" /> Requisitos
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-gold-500" /> Passaporte/ID válido no Estado</li>
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-gold-500" /> Nada consta criminal (sem passagens recentes)</li>
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-gold-500" /> Aptidão física e psicológica</li>
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-gold-500" /> Conhecimento do Código Penal</li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-6 flex items-center gap-2 font-display text-lg font-bold text-white">
                <Users size={20} className="text-gold-400" /> Divisões Internas
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {DIVISOES.map(d => (
                  <div key={d.id} className="rounded-lg border border-white/5 bg-navy-900/50 p-4 transition hover:border-gold-500/20">
                    <h4 className="font-bold text-gold-400">{d.nome}</h4>
                    <p className="mt-1 text-xs text-slate-400">{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={() => setEtapa('FORM')}
                className="dce-btn-primary px-12 py-4 text-lg"
              >
                <FileText size={20} /> Iniciar Inscrição
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-up">
            <h2 className="mb-8 font-display text-3xl font-bold uppercase text-white">Ficha de Candidatura</h2>
            
            {feedback && (
              feedback.type === 'success' 
                ? <InlineSuccess>{feedback.message}</InlineSuccess> 
                : <InlineError>{feedback.message}</InlineError>
            )}

            <form onSubmit={handleSubmit} className="dce-panel space-y-6 p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Passaporte/ID</label>
                  <input 
                    required
                    type="text"
                    className="w-full rounded border border-white/10 bg-navy-950 px-4 py-2 text-white outline-none focus:border-gold-500/50"
                    placeholder="Ex: 1234"
                    value={form.passaporte}
                    onChange={e => setForm({...form, passaporte: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Nome Completo (IC)</label>
                  <input 
                    required
                    type="text"
                    className="w-full rounded border border-white/10 bg-navy-950 px-4 py-2 text-white outline-none focus:border-gold-500/50"
                    placeholder="Ex: John Doe"
                    value={form.nome}
                    onChange={e => setForm({...form, nome: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Email de Contato</label>
                <input 
                  required
                  type="email"
                  className="w-full rounded border border-white/10 bg-navy-950 px-4 py-2 text-white outline-none focus:border-gold-500/50"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Senha de Acesso</label>
                <input 
                  required
                  type="password"
                  className="w-full rounded border border-white/10 bg-navy-950 px-4 py-2 text-white outline-none focus:border-gold-500/50"
                  placeholder="Mínimo 6 caracteres"
                  value={form.senha}
                  onChange={e => setForm({...form, senha: e.target.value})}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Divisão Pretendida</label>
                <select 
                  className="w-full rounded border border-white/10 bg-navy-950 px-4 py-2 text-white outline-none focus:border-gold-500/50"
                  value={form.divisaoPretendida}
                  onChange={e => setForm({...form, divisaoPretendida: e.target.value})}
                >
                  {DIVISOES.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Questionário de RP (Por que deseja entrar no DCE? Fale sobre sua experiência)</label>
                <textarea 
                  required
                  rows={6}
                  className="w-full rounded border border-white/10 bg-navy-950 px-4 py-2 text-white outline-none focus:border-gold-500/50"
                  placeholder="Escreva aqui seu texto de apresentação..."
                  value={form.respostasEdital}
                  onChange={e => setForm({...form, respostasEdital: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <button type="button" onClick={() => setEtapa('INFO')} className="text-sm text-slate-500 hover:text-white">
                  Voltar
                </button>
                <button 
                  disabled={enviando}
                  type="submit" 
                  className="dce-btn-primary px-8"
                >
                  {enviando ? 'Enviando...' : <><Send size={16} /> Enviar Candidatura</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
