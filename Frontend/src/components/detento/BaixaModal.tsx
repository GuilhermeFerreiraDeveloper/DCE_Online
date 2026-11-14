import { useEffect, useState } from 'react'
import { Gavel } from 'lucide-react'
import type { Detento } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Field } from '@/components/ui/Field'
import { InlineError } from '@/components/ui/Feedback'
import { dceApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'

interface Props {
  detento: Detento | null
  aberto: boolean
  onFechar: () => void
  onSalvo: () => void
}

export function BaixaModal({ detento, aberto, onFechar, onSalvo }: Props) {
  const oficial = useAuthStore((s) => s.oficial)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (aberto) {
      setMotivo('')
      setErro('')
    }
  }, [aberto])

  if (!detento || !oficial) return null

  const confirmar = async () => {
    setErro('')
    if (!motivo.trim()) {
      setErro('Informe o motivo da soltura / baixa.')
      return
    }
    setSalvando(true)
    try {
      await dceApi.darBaixa(detento.id, motivo.trim(), { id: oficial.id, nome: oficial.nome })
      onSalvo()
      onFechar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível dar baixa.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Dar Baixa / Soltura"
      subtitulo={`${detento.nomeDetento} · ID ${detento.passaporteDetento}`}
      footer={
        <>
          <button onClick={onFechar} className="dce-btn-ghost">
            Cancelar
          </button>
          <button onClick={confirmar} disabled={salvando} className="dce-btn-primary">
            <Gavel size={16} />
            {salvando ? 'Processando...' : 'Confirmar Libertação'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {erro && <InlineError>{erro}</InlineError>}
        <p className="text-sm text-slate-400">
          Esta ação encerra a custódia do detento e o registra como <strong className="text-emerald-300">LIBERADO</strong>.
        </p>
        <Field label="Motivo da Soltura (obrigatório)">
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className="dce-input resize-none"
            placeholder="Ex.: Pena cumprida, pagamento de fiança, alvará judicial..."
            required
          />
        </Field>
      </div>
    </Modal>
  )
}
