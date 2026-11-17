import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  ShieldHalf,
  UserCheck,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Avatar } from '@/components/ui/Avatar'
import { DemoBanner } from './DemoBanner'

const NAV = [
  { to: '/painel', label: 'Painel de Presos', icon: LayoutDashboard, niveis: [1, 2, 3] },
  { to: '/painel/novo', label: 'Nova Ficha', icon: FilePlus2, niveis: [1, 2, 3] },
  { to: '/painel/codigo-penal', label: 'Código Penal', icon: BookOpen, niveis: [1, 2, 3] },
  { to: '/painel/perfil', label: 'Minha Conta', icon: UserCog, niveis: [1, 2, 3] },
  { to: '/comando/aprovacoes', label: 'Aprovações', icon: UserCheck, niveis: [1] },
  { to: '/comando/oficiais', label: 'Oficiais', icon: Users, niveis: [1] },
  { to: '/comando/auditoria', label: 'Auditoria', icon: ScrollText, niveis: [1] },
  { to: '/comando/estatisticas', label: 'Estatísticas', icon: BarChart3, niveis: [1] },
] as const

const NIVEL_LABEL: Record<number, string> = {
  1: 'Comando / Staff',
  2: 'Oficialidade',
  3: 'Praças e Graduações',
}

export function OfficerLayout() {
  const [menuAberto, setMenuAberto] = useState(false)
  const { oficial, logout } = useAuthStore()
  const navigate = useNavigate()

  const itens = NAV.filter((n) => (n.niveis as readonly number[]).includes(oficial?.nivelAcesso ?? 3))

  const sair = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
        <span className="grid h-10 w-10 place-items-center rounded-md border border-gold-500/40 bg-navy-950 text-gold-400">
          <ShieldHalf size={20} />
        </span>
        <span className="leading-tight">
          <span className="block font-display text-base font-semibold tracking-wide text-white">DCE</span>
          <span className="block text-[0.6rem] uppercase tracking-[0.28em] text-gold-400/80">Custódia do Estado</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {itens.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/painel'}
            onClick={() => setMenuAberto(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'border border-gold-500/30 bg-gold-500/10 text-gold-200'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 p-3">
        <Link
          to="/painel/perfil"
          onClick={() => setMenuAberto(false)}
          className="flex items-center gap-3 rounded-md bg-white/[0.03] px-3 py-2.5 transition hover:bg-white/[0.06]"
          title="Minha Conta"
        >
          <Avatar nome={oficial?.nome ?? 'DCE'} fotoUrl={oficial?.fotoUrl} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{oficial?.nome}</p>
            <p className="truncate text-[0.68rem] uppercase tracking-wider text-gold-400/80">
              {oficial?.patente} · N{oficial?.nivelAcesso}
            </p>
          </div>
        </Link>
        <button onClick={sair} className="dce-btn-ghost mt-2 w-full justify-start !text-red-300 hover:!bg-red-500/10">
          <LogOut size={16} />
          Encerrar Sessão
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/5 bg-navy-900/60 lg:block">
        {SidebarContent}
      </aside>

      {/* Drawer mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMenuAberto(false)} />
          <div className="absolute left-0 top-0 h-full w-72 animate-fade-in border-r border-white/10 bg-navy-900">
            <button
              onClick={() => setMenuAberto(false)}
              className="absolute right-2 top-3 rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
            {SidebarContent}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <DemoBanner />

        {/* Header mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/5 bg-navy-950/85 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setMenuAberto(true)}
            className="rounded-md border border-white/10 p-2 text-slate-300 hover:border-gold-500/40 hover:text-white"
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
          <Link to="/painel" className="flex items-center gap-2">
            <ShieldHalf size={18} className="text-gold-400" />
            <span className="font-display text-sm font-semibold tracking-wide text-white">DCE · CUSTÓDIA</span>
          </Link>
          <button onClick={sair} className="rounded-md p-2 text-red-300 hover:bg-red-500/10" aria-label="Sair">
            <LogOut size={18} />
          </button>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-white/5 px-6 py-4 text-center text-xs text-slate-500">
          {NIVEL_LABEL[oficial?.nivelAcesso ?? 3]} · Departamento de Custódia do Estado — uso restrito a oficiais.
        </footer>
      </div>
    </div>
  )
}
