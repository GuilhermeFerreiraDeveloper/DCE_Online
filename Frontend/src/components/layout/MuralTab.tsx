import { useState, useEffect } from 'react'
import { AlertTriangle, Info, Bell, Plus, Send } from 'lucide-react'
import { dceApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import type { Aviso, NivelUrgencia } from '@/types'
import { formatDateTime } from '@/utils/format'

export function MuralTab() {
  const oficial = useAuthStore(s => s.oficial)
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostrandoForm, setMostrandoForm] = useState(false)
  
  const [novo, setNovo] = useState({
    titulo: '',
    mensagem: '',
    imagemUrl: '',
    nivelUrgencia: 'INFORMATIVO' as NivelUrgencia
  })

  const carregar = async () => {
    try {
      const res = await dceApi.avisos()
      setAvisos(res)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await dceApi.postAviso(novo)
    setMostrandoForm(false)
    setNovo({ titulo: '', mensagem: '', imagemUrl: '', nivelUrgencia: 'INFORMATIVO' })
    carregar()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const item = e.clipboardData.items[0]
    if (item?.type.includes('image')) {
      const blob = item.getAsFile()
      if (blob) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setNovo(prev => ({ ...prev, imagemUrl: event.target?.result as string }))
        }
        reader.readAsDataURL(blob)
      }
    }
  }

  const getUrgenciaIcon = (nivel: NivelUrgencia) => {
    switch (nivel) {
      case 'URGENTE': return <AlertTriangle className="text-red-500" size={16} />
      case 'ALERTA': return <Bell className="text-amber-500" size={16} />
      default: return <Info className="text-blue-400" size={16} />
    }
  }

  return (
    <div className="space-y-6">
      {oficial?.nivelAcesso === 1 && (
        <div className="dce-panel p-4">
          {!mostrandoForm ? (
            <button 
              onClick={() => setMostrandoForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-white/20 py-3 text-sm text-slate-400 hover:border-gold-500/50 hover:text-gold-400"
            >
              <Plus size={16} /> Publicar Novo Aviso do Comando
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input 
                  required
                  placeholder="Título do Aviso"
                  className="w-full rounded border border-white/10 bg-navy-950 px-3 py-2 text-sm text-white outline-none focus:border-gold-500/50"
                  value={novo.titulo}
                  onChange={e => setNovo({...novo, titulo: e.target.value})}
                />
                <select 
                  className="w-full rounded border border-white/10 bg-navy-950 px-3 py-2 text-sm text-white outline-none focus:border-gold-500/50"
                  value={novo.nivelUrgencia}
                  onChange={e => setNovo({...novo, nivelUrgencia: e.target.value as NivelUrgencia})}
                >
                  <option value="INFORMATIVO">Informativo</option>
                  <option value="ALERTA">Alerta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>
              <textarea 
                required
                onPaste={handlePaste}
                placeholder="Mensagem (Você pode colar uma imagem diretamente aqui com Ctrl+V)"
                className="w-full rounded border border-white/10 bg-navy-950 px-3 py-2 text-sm text-white outline-none focus:border-gold-500/50"
                rows={4}
                value={novo.mensagem}
                onChange={e => setNovo({...novo, mensagem: e.target.value})}
              />
              {novo.imagemUrl && (
                <div className="relative inline-block">
                  <img src={novo.imagemUrl} className="max-h-40 rounded border border-white/10" alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => setNovo({...novo, imagemUrl: ''})}
                    className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white shadow-lg"
                  >
                    <Plus size={12} className="rotate-45" />
                  </button>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setMostrandoForm(false)} className="dce-btn-ghost text-xs">Cancelar</button>
                <button type="submit" className="dce-btn-primary text-xs"><Send size={14} /> Publicar Aviso</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="space-y-4">
        {avisos.map(a => (
          <div key={a.id} className={`dce-panel overflow-hidden border-l-4 ${
            a.nivelUrgencia === 'URGENTE' ? 'border-l-red-600' : 
            a.nivelUrgencia === 'ALERTA' ? 'border-l-amber-500' : 'border-l-blue-500'
          }`}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {getUrgenciaIcon(a.nivelUrgencia)}
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      a.nivelUrgencia === 'URGENTE' ? 'text-red-400' : 
                      a.nivelUrgencia === 'ALERTA' ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {a.nivelUrgencia}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold text-white">{a.titulo}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-300">{a.autorNome}</p>
                  <p className="text-[10px] uppercase text-gold-400">{a.autorPatente}</p>
                </div>
              </div>
              
              <p className="mt-4 whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">
                {a.mensagem}
              </p>

              {a.imagemUrl && (
                <div className="mt-4 overflow-hidden rounded border border-white/5">
                  <img src={a.imagemUrl} className="w-full" alt="Aviso" />
                </div>
              )}

              <div className="mt-4 border-t border-white/5 pt-3 text-[10px] text-slate-500">
                Publicado em: {formatDateTime(a.dataCriacao)}
              </div>
            </div>
          </div>
        ))}
        {avisos.length === 0 && !carregando && (
          <div className="py-10 text-center text-slate-500">Nenhum aviso publicado no mural.</div>
        )}
      </div>
    </div>
  )
}
