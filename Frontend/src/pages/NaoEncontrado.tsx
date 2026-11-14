import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { PublicHeader } from '@/components/layout/PublicHeader'

export default function NaoEncontrado() {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-lg border border-gold-500/30 bg-navy-900 text-gold-400">
          <ShieldAlert size={30} />
        </span>
        <h1 className="font-display text-4xl font-semibold text-white">404 · Área Restrita</h1>
        <p className="text-slate-400">
          O recurso solicitado não existe ou você não possui autorização para acessá-lo.
        </p>
        <Link to="/" className="dce-btn-primary">
          Voltar ao Início
        </Link>
      </main>
    </div>
  )
}
