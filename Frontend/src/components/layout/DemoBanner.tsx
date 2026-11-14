import { WifiOff } from 'lucide-react'
import { useConnectionStore } from '@/store/connection'

export function DemoBanner() {
  const demoMode = useConnectionStore((s) => s.demoMode)
  if (demoMode !== true) return null
  return (
    <div className="flex items-center justify-center gap-2 border-b border-gold-500/25 bg-gold-500/10 px-4 py-1.5 text-center text-xs font-medium text-gold-300">
      <WifiOff size={14} />
      <span>
        MODO DEMONSTRAÇÃO — a API .NET está inacessível. Os dados exibidos são simulados e persistidos localmente.
      </span>
    </div>
  )
}
