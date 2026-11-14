import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import type { Detento, NivelPericulosidade, StatusPrisao } from '@/types'
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

const STATUS: { valor: StatusPrisao; label: string }[] = [
  { valor: 'EM_CUSTODIA', label: 'Em Custódia' },
  { valor: 'LIBERADO', label: 'Liberado' },
  { valor: 'FORAGIDO', label: 'Foragido' },
]

export function EditarFichaModal({ detento, aberto, onFechar, onSalvo }: Props) {
  const oficial = useAuthStore((s) => s.oficial)
  const [form, setForm] = useState({
    nomeDetento: '',
    fotoUrl: '',
    policialCondutor: '',
    nivelPericulosidade: 'MODERADO' as NivelPericulosidade,
    statusPrisao: 'EM_CUSTODIA' as StatusPrisao,
  })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (aberto && detento) {
      setForm({
        nomeDetento: detento.nomeDetento,
        fotoUrl: detento.fotoUrl ?? '',
        policialCondutor: detento.policialCondutor ?? '',
        nivelPericulosidade: detento.nivelPericulosidade ?? 'MODERADO',
        statusPrisao: detento.statusPrisao,
      })
      setErro('')
    }
  }, [aberto, detento])

  if (!detento || !oficial) return null

  const salvar = async () => {
    setErro('')
    setSalvando(true)
    try {
      await dceApi.atualizarDetento(
        detento.id,
        {
          nomeDetento: form.nomeDetento,
          fotoUrl: form.fotoUrl.trim() || null,
          policialCondutor: form.policialCondutor.trim() || null,
          nivelPericulosidade: form.nivelPericulosidade,
          statusPrisao: form.statusPrisao,
        },
        { id: oficial.id, nome: oficial.nome },
      )
      onSalvo()
      onFechar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar as alterações.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Editar Ficha"
      subtitulo={`ID ${detento.passaporteDetento}`}
      footer={
        <>
          <button onClick={onFechar} className="dce-btn-ghost">
            Cancelar
          </button>
          <button onClick={salvar} disabled={salvando} className="dce-btn-primary">
            <Save size={16} />
            {salvando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {erro && <InlineError>{erro}</InlineError>}
        <Field label="Nome Completo (RP)">
          <input
            value={form.nomeDetento}
            onChange={(e) => setForm((f) => ({ ...f, nomeDetento: e.target.value }))}
            className="dce-input"
          />
        </Field>
        <Field label="Link da Foto (Mugshot)">
          <input
            value={form.fotoUrl}
            onChange={(e) => setForm((f) => ({ ...f, fotoUrl: e.target.value }))}
            className="dce-input text-xs"
            placeholder="https://..."
          />
        </Field>
        <Field label="Órgão / Policial Condutor">
          <input
            value={form.policialCondutor}
            onChange={(e) => setForm((f) => ({ ...f, policialCondutor: e.target.value }))}
            className="dce-input"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nível de Periculosidade">
            <select
              value={form.nivelPericulosidade}
              onChange={(e) => setForm((f) => ({ ...f, nivelPericulosidade: e.target.value as NivelPericulosidade }))}
              className="dce-input"
            >
              <option value="BAIXO">🟢 Baixo</option>
              <option value="MODERADO">🟡 Moderado</option>
              <option value="ALTO">🔴 Alto / Perigoso</option>
            </select>
          </Field>
          <Field label="Status da Prisão">
            <select
              value={form.statusPrisao}
              onChange={(e) => setForm((f) => ({ ...f, statusPrisao: e.target.value as StatusPrisao }))}
              className="dce-input"
            >
              {STATUS.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>
    </Modal>
  )
}
