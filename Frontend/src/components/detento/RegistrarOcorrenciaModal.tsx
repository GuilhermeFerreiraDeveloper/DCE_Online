import { useEffect, useState } from 'react'
import { AlertTriangle, MessageSquarePlus } from 'lucide-react'
import type { Detento, HistoricoComportamento, NivelPericulosidade } from '@/types'
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
  /** Nível 2+ pode aplicar regime disciplinar (solitária). */
  permitirRegimeDisciplinar?: boolean
}

const TODOS_TIPOS: { valor: HistoricoComportamento['tipoRegistro']; label: string }[] = [
  { valor: 'BOM_COMPORTAMENTO', label: 'Bom Comportamento' },
  { valor: 'MAU_COMPORTAMENTO', label: 'Mau Comportamento' },
  { valor: 'SOLITARIA', label: 'Punição / Solitária' },
]

export function RegistrarOcorrenciaModal({
  detento,
  aberto,
  onFechar,
  onSalvo,
  permitirRegimeDisciplinar = true,
}: Props) {
  const oficial = useAuthStore((s) => s.oficial)
  const TIPOS = permitirRegimeDisciplinar ? TODOS_TIPOS : TODOS_TIPOS.filter((t) => t.valor !== 'SOLITARIA')
  const [tipo, setTipo] = useState<HistoricoComportamento['tipoRegistro']>('MAU_COMPORTAMENTO')
  const [periculosidade, setPericulosidade] = useState<NivelPericulosidade>('MODERADO')
  const [motivo, setMotivo] = useState('')
  const [prazoDias, setPrazoDias] = useState(3)
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (aberto && detento) {
      setTipo('MAU_COMPORTAMENTO')
      setPericulosidade(detento.nivelPericulosidade ?? 'MODERADO')
      setMotivo(detento.motivoSolitaria ?? '')
      setPrazoDias(3)
      setDescricao('')
      setErro('')
    }
  }, [aberto, detento])

  if (!detento || !oficial) return null

  const emSolitaria = tipo === 'SOLITARIA'

  const salvar = async () => {
    setErro('')
    if (emSolitaria && !motivo.trim()) {
      setErro('Informe o Motivo da Punição — obrigatório para o regime de solitária.')
      return
    }
    if (emSolitaria && prazoDias <= 0) {
      setErro('Informe um prazo de isolamento válido (em dias).')
      return
    }
    setSalvando(true)
    try {
      await dceApi.registrarComportamento(
        detento.id,
        {
          tipoRegistro: tipo,
          nivelPericulosidade: periculosidade,
          emSolitaria,
          motivoSolitaria: emSolitaria ? motivo.trim() : null,
          terminoSolitaria: emSolitaria
            ? new Date(Date.now() + prazoDias * 86400000).toISOString()
            : null,
          descricao: descricao.trim() || null,
        },
        { id: oficial.id, nome: oficial.nome },
      )
      onSalvo()
      onFechar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível registrar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Registrar Ocorrência"
      subtitulo={`${detento.nomeDetento} · ID ${detento.passaporteDetento}`}
      footer={
        <>
          <button onClick={onFechar} className="dce-btn-ghost">
            Cancelar
          </button>
          <button onClick={salvar} disabled={salvando} className="dce-btn-primary">
            <MessageSquarePlus size={16} />
            {salvando ? 'Salvando...' : 'Registrar'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {erro && <InlineError>{erro}</InlineError>}

        <Field label="Tipo de Registro">
          <div className="grid grid-cols-3 gap-2">
            {TIPOS.map((t) => (
              <button
                key={t.valor}
                type="button"
                onClick={() => setTipo(t.valor)}
                className={`rounded-md border px-2 py-2.5 text-xs font-semibold uppercase tracking-wide transition ${
                  tipo === t.valor
                    ? 'border-gold-500/50 bg-gold-500/15 text-gold-200'
                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Nível de Periculosidade">
          <div className="grid grid-cols-3 gap-2">
            {(['BAIXO', 'MODERADO', 'ALTO'] as NivelPericulosidade[]).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPericulosidade(n)}
                className={`rounded-md border px-2 py-2.5 text-xs font-semibold uppercase tracking-wide transition ${
                  periculosidade === n
                    ? 'border-gold-500/50 bg-gold-500/15 text-gold-200'
                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'
                }`}
              >
                {n === 'BAIXO' ? '🟢 Baixo' : n === 'MODERADO' ? '🟡 Moderado' : '🔴 Alto'}
              </button>
            ))}
          </div>
        </Field>

        {emSolitaria && (
          <div className="space-y-4 rounded-md border border-fuchsia-500/25 bg-fuchsia-500/5 p-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fuchsia-300">
              <AlertTriangle size={14} /> Encaminhamento ao Regime Disciplinar
            </p>
            <Field label="Motivo da Punição (obrigatório)">
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                className="dce-input resize-none"
                placeholder="Descreva o motivo do isolamento..."
                required
              />
            </Field>
            <Field label="Prazo de Isolamento (dias)">
              <input
                type="number"
                min={1}
                value={prazoDias}
                onChange={(e) => setPrazoDias(Number(e.target.value))}
                className="dce-input"
              />
            </Field>
          </div>
        )}

        <Field label="Descrição / Observações">
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            className="dce-input resize-none"
            placeholder="Detalhes adicionais do registro..."
          />
        </Field>
      </div>
    </Modal>
  )
}
