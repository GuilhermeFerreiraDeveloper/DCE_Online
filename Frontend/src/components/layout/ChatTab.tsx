import { useState, useEffect, useRef } from 'react'
import { Send, Users, Shield } from 'lucide-react'
import { dceApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import type { ChatMessage, RegistroPonto } from '@/types'
import { formatTime } from '@/utils/format'

export function ChatTab() {
  const oficial = useAuthStore(s => s.oficial)
  const [mensagens, setMensagens] = useState<ChatMessage[]>([])
  const [ativos, setAtivos] = useState<RegistroPonto[]>([])
  const [novaMsg, setNovaMsg] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const carregar = async () => {
    try {
      const [msgs, emServico] = await Promise.all([
        dceApi.chat(),
        dceApi.pontoAtivos()
      ])
      setMensagens(msgs)
      setAtivos(emServico)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    carregar()
    const interval = setInterval(carregar, 5000) // Polling a cada 5s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novaMsg.trim()) return
    const msg = novaMsg
    setNovaMsg('')
    try {
      await dceApi.postChatMessage(msg)
      carregar()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex h-[calc(100vh-300px)] gap-4 overflow-hidden">
      {/* CHAT PRINCIPAL */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-white/5 bg-navy-900/30">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mensagens.map(m => (
            <div key={m.id} className={`flex flex-col ${m.oficialId === oficial?.id ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-500">{formatTime(m.dataEnvio)}</span>
                <span className="text-[10px] font-bold uppercase text-gold-400">{m.patente}</span>
                <span className="text-[11px] font-bold text-white">{m.nomeOficial}</span>
              </div>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.oficialId === oficial?.id 
                  ? 'bg-gold-600 text-navy-950 rounded-tr-none font-medium' 
                  : 'bg-navy-800 text-slate-200 rounded-tl-none border border-white/5'
              }`}>
                {m.mensagem}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={enviar} className="border-t border-white/5 p-3">
          <div className="flex gap-2">
            <input 
              value={novaMsg}
              onChange={e => setNovaMsg(e.target.value)}
              placeholder="Digite sua mensagem no plantão..."
              className="flex-1 rounded border border-white/10 bg-navy-950 px-4 py-2 text-sm text-white outline-none focus:border-gold-500/50"
            />
            <button type="submit" className="dce-btn-primary !px-4">
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* BARRA LATERAL - OFICIAIS EM SERVIÇO */}
      <div className="w-64 flex flex-col overflow-hidden rounded-lg border border-white/5 bg-navy-900/50">
        <div className="flex items-center gap-2 border-b border-white/5 p-3 text-xs font-bold uppercase tracking-widest text-gold-400">
          <Users size={14} /> Oficiais em Serviço ({ativos.length})
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {ativos.map(a => (
            <div key={a.id} className="flex items-center gap-3 rounded bg-white/[0.02] p-2">
              <div className="relative">
                <div className="h-8 w-8 rounded bg-navy-800 flex items-center justify-center text-gold-400">
                  <Shield size={16} />
                </div>
                <div className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-navy-900 bg-green-500" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-white">{a.nomeOficial}</p>
                <p className="truncate text-[9px] uppercase text-slate-500">{a.patente}</p>
              </div>
            </div>
          ))}
          {ativos.length === 0 && (
            <div className="py-4 text-center text-[10px] text-slate-500">Ninguém em serviço.</div>
          )}
        </div>
      </div>
    </div>
  )
}
