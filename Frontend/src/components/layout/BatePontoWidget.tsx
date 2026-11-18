import { useState, useEffect } from 'react'
import { Clock, Play, Square, Timer } from 'lucide-react'
import { dceApi } from '@/services/api'
import type { RegistroPonto } from '@/types'

export function BatePontoWidget() {
  const [pontoAtivo, setPontoAtivo] = useState<RegistroPonto | null>(null)
  const [segundos, setSegundos] = useState(0)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    dceApi.pontoAtivos().then(ativos => {
      // Simplificação: pega o primeiro ponto do oficial logado
      // Em um cenário real, o backend retornaria apenas o do oficial
      const meuPonto = ativos[0] // Assumindo que o primeiro é o dele para o demo
      if (meuPonto) {
        setPontoAtivo(meuPonto)
        const inicio = new Date(meuPonto.entrada).getTime()
        const agora = new Date().getTime()
        setSegundos(Math.floor((agora - inicio) / 1000))
      }
    })
  }, [])

  useEffect(() => {
    let interval: number | undefined
    if (pontoAtivo) {
      interval = window.setInterval(() => {
        setSegundos(s => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [pontoAtivo])

  const iniciar = async () => {
    setCarregando(true)
    try {
      const res = await dceApi.iniciarPonto()
      setPontoAtivo(res)
      setSegundos(0)
    } finally {
      setCarregando(false)
    }
  }

  const encerrar = async () => {
    setCarregando(true)
    try {
      await dceApi.encerrarPonto()
      setPontoAtivo(null)
      setSegundos(0)
    } finally {
      setCarregando(false)
    }
  }

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600)
    const mins = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-white/5 bg-navy-900/50 px-4 py-2 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 border-r border-white/10 pr-4">
        <Clock size={16} className={pontoAtivo ? 'animate-pulse text-amber-500' : 'text-slate-500'} />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Status: <span className={pontoAtivo ? 'text-green-500' : 'text-red-500'}>
            {pontoAtivo ? 'Em Serviço' : 'Fora de Serviço'}
          </span>
        </span>
      </div>

      {pontoAtivo && (
        <div className="flex items-center gap-2 border-r border-white/10 pr-4">
          <Timer size={16} className="text-gold-400" />
          <span className="font-mono text-sm font-bold text-white">{formatTimer(segundos)}</span>
        </div>
      )}

      <button
        disabled={carregando}
        onClick={pontoAtivo ? encerrar : iniciar}
        className={`flex items-center gap-2 rounded px-3 py-1 text-[10px] font-bold uppercase transition-all ${
          pontoAtivo 
            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' 
            : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
        }`}
      >
        {pontoAtivo ? (
          <><Square size={12} fill="currentColor" /> Encerrar Plantão</>
        ) : (
          <><Play size={12} fill="currentColor" /> Iniciar Plantão</>
        )}
      </button>
    </div>
  )
}
