import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import type { CodigoPenalArtigo } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Field } from '@/components/ui/Field'
import { InlineError } from '@/components/ui/Feedback'

interface Props {
  aberto: boolean
  artigo: CodigoPenalArtigo | null
  onFechar: () => void
  onSalvar: (dados: Omit<CodigoPenalArtigo, 'id'>) => Promise<void>
}

const VAZIO: Omit<CodigoPenalArtigo, 'id'> = {
  artigo: '',
  crime: '',
  tornozeleira: false,
  permiteFianca: true,
  valorFianca: 0,
  tempoMeses: 0,
  valorMulta: 0,
  descricao: '',
}

export function ArtigoModal({ aberto, artigo, onFechar, onSalvar }: Props) {
  const [form, setForm] = useState<Omit<CodigoPenalArtigo, 'id'>>(VAZIO)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (aberto) {
      setForm(artigo ? { ...artigo } : VAZIO)
      setErro('')
    }
  }, [aberto, artigo])

  const salvar = async () => {
    setErro('')
    if (!form.artigo.trim() || !form.crime.trim()) {
      setErro('Informe o número do artigo e o nome do crime.')
      return
    }
    setSalvando(true)
    try {
      await onSalvar(form)
      onFechar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar o artigo.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={artigo ? 'Editar Artigo' : 'Novo Artigo'}
      subtitulo="Código Penal do Estado"
      footer={
        <>
          <button onClick={onFechar} className="dce-btn-ghost">
            Cancelar
          </button>
          <button onClick={salvar} disabled={salvando} className="dce-btn-primary">
            <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {erro && <InlineError>{erro}</InlineError>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Artigo">
            <input
              value={form.artigo}
              onChange={(e) => setForm((f) => ({ ...f, artigo: e.target.value }))}
              className="dce-input font-mono"
              placeholder="Ex.: ART. 11"
            />
          </Field>
          <Field label="Crime">
            <input
              value={form.crime}
              onChange={(e) => setForm((f) => ({ ...f, crime: e.target.value }))}
              className="dce-input"
              placeholder="Nome do crime"
            />
          </Field>
          <Field label="Tempo de Pena (meses)">
            <input
              type="number"
              min={0}
              value={form.tempoMeses}
              onChange={(e) => setForm((f) => ({ ...f, tempoMeses: Number(e.target.value) }))}
              className="dce-input"
            />
          </Field>
          <Field label="Valor da Multa (R$)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.valorMulta}
              onChange={(e) => setForm((f) => ({ ...f, valorMulta: Number(e.target.value) }))}
              className="dce-input"
            />
          </Field>
          <Field label="Valor da Fiança (R$)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.valorFianca}
              onChange={(e) => setForm((f) => ({ ...f, valorFianca: Number(e.target.value) }))}
              className="dce-input"
            />
          </Field>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.permiteFianca}
                onChange={(e) => setForm((f) => ({ ...f, permiteFianca: e.target.checked }))}
                className="h-4 w-4 accent-[#c9a227]"
              />
              Permite fiança
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.tornozeleira}
                onChange={(e) => setForm((f) => ({ ...f, tornozeleira: e.target.checked }))}
                className="h-4 w-4 accent-[#c9a227]"
              />
              Tornozeleira
            </label>
          </div>
        </div>
        <Field label="Descrição">
          <textarea
            value={form.descricao}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            rows={3}
            className="dce-input resize-none"
            placeholder="Descrição do crime e observações..."
          />
        </Field>
      </div>
    </Modal>
  )
}
