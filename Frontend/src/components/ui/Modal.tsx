import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  aberto: boolean
  titulo: string
  subtitulo?: string
  onFechar: () => void
  children: ReactNode
  footer?: ReactNode
  larguraMax?: string
}

export function Modal({ aberto, titulo, subtitulo, onFechar, children, footer, larguraMax = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (!aberto) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onFechar}
    >
      <div
        className={`dce-panel w-full ${larguraMax} animate-fade-up rounded-b-none border-gold-500/20 sm:rounded-lg`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/5 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{titulo}</h3>
            {subtitulo && <p className="mt-0.5 text-sm text-slate-400">{subtitulo}</p>}
          </div>
          <button
            onClick={onFechar}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-white/5 px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}
