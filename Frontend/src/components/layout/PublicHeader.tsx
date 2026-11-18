import { Link, NavLink } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-navy-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-3 transition-all duration-300 hover:scale-105">
          <img 
            src="/DCELOGO.png" 
            alt="DCE Logo" 
            className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
          />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold tracking-wide text-white">
              DEPARTAMENTO DE CUSTÓDIA
            </span>
            <span className="block text-[0.62rem] uppercase tracking-[0.34em] text-gold-400/80">
              do Estado · GTA RP
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <NavLink to="/login" className="dce-btn-secondary">
            <LogIn size={16} />
            Entrar
          </NavLink>
          <NavLink to="/cadastro" className="dce-btn-primary">
            <UserPlus size={16} />
            Solicitar Cadastro
          </NavLink>
        </nav>

        <nav className="flex items-center gap-2 sm:hidden">
          <NavLink to="/login" className="dce-btn-secondary !px-3" aria-label="Entrar">
            <LogIn size={16} />
          </NavLink>
          <NavLink to="/cadastro" className="dce-btn-primary !px-3" aria-label="Solicitar cadastro">
            <UserPlus size={16} />
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
