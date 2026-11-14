import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, FilePlus2, Gavel, Image, ShieldPlus, UserRound } from 'lucide-react'
import { Field } from '@/components/ui/Field'
import { InlineError, Spinner } from '@/components/ui/Feedback'
import { PenalCalculadora } from '@/components/detento/PenalCalculadora'
import { dceApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { formatBRL, mesesParaTexto } from '@/utils/format'
import type { CodigoPenalArtigo, NivelPericulosidade } from '@/types'

export default function NovoDetento() {
  const oficial = useAuthStore((s) => s.oficial)
  const navigate = useNavigate()

  const [artigos, setArtigos] = useState<CodigoPenalArtigo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [selecionados, setSelecionados] = useState<number[]>([])
  const [form, setForm] = useState({
    nomeDetento: '',
    passaporteDetento: '',
    fotoUrl: '',
    policialCondutor: '',
  })
  const [periculosidade, setPericulosidade] = useState<NivelPericulosidade>('MODERADO')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        setArtigos(await dceApi.listarCodigoPenal())
      } catch {
        setErro('Não foi possível carregar o código penal.')
      } finally {
        setCarregando(false)
      }
    })()
  }, [])

  const artigosSelecionados = useMemo(
    () => artigos.filter((a) => selecionados.includes(a.id)),
    [artigos, selecionados],
  )

  const toggle = (id: number) =>
    setSelecionados((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const submeter = async (e: FormEvent) => {
    e.preventDefault()
    setErro('')
    if (!oficial) return
    if (!form.nomeDetento.trim() || !form.passaporteDetento.trim()) {
      return setErro('Preencha o Nome e o Passaporte/ID do detento.')
    }
    if (selecionados.length === 0) {
      return setErro('Selecione ao menos um artigo do código penal.')
    }
    setSalvando(true)
    try {
      const criado = await dceApi.criarDetento(
        {
          nomeDetento: form.nomeDetento,
          passaporteDetento: form.passaporteDetento,
          fotoUrl: form.fotoUrl.trim() || null,
          artigoIds: selecionados,
          policialCondutor: form.policialCondutor.trim() || 'Não informado',
          nivelPericulosidade: periculosidade,
        },
        { id: oficial.id, nome: oficial.nome },
      )
      navigate(`/painel/detento/${criado.id}`)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível registrar a ficha.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="dce-section-title">
          <ShieldPlus size={14} /> Registro de Detentos
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-white">Nova Ficha de Detento</h1>
        <p className="mt-1 text-sm text-slate-400">
          Preencha a identificação, selecione os crimes cometidos e o sistema calculará pena, multa, fiança e
          tornozeleira automaticamente.
        </p>
      </header>

      {carregando ? (
        <Spinner label="Carregando código penal..." />
      ) : (
        <form onSubmit={submeter} className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Identificação */}
            <section className="dce-panel p-5">
              <p className="dce-section-title">
                <UserRound size={14} /> Identificação
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Nome Completo (RP)" className="sm:col-span-2">
                  <input
                    value={form.nomeDetento}
                    onChange={(e) => setForm((f) => ({ ...f, nomeDetento: e.target.value }))}
                    className="dce-input"
                    placeholder="Nome e sobrenome do detento"
                    required
                  />
                </Field>
                <Field label="Passaporte / ID">
                  <input
                    value={form.passaporteDetento}
                    onChange={(e) => setForm((f) => ({ ...f, passaporteDetento: e.target.value }))}
                    className="dce-input font-mono"
                    placeholder="Ex.: 2001"
                    inputMode="numeric"
                    required
                  />
                </Field>
                <Field label="Órgão / Policial Condutor">
                  <input
                    value={form.policialCondutor}
                    onChange={(e) => setForm((f) => ({ ...f, policialCondutor: e.target.value }))}
                    className="dce-input"
                    placeholder="Ex.: PM — 3º Batalhão"
                  />
                </Field>
                <Field label="Link da Foto (Mugshot)" className="sm:col-span-2" hint="URL opcional da imagem do detento.">
                  <div className="relative">
                    <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      value={form.fotoUrl}
                      onChange={(e) => setForm((f) => ({ ...f, fotoUrl: e.target.value }))}
                      className="dce-input pl-9 text-xs"
                      placeholder="https://..."
                    />
                  </div>
                </Field>
              </div>

              <div className="mt-4 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-slate-400">
                Oficial responsável pelo cadastro:{' '}
                <strong className="text-gold-300">
                  {oficial?.nome} · {oficial?.patente} (N{oficial?.nivelAcesso})
                </strong>{' '}
                — preenchido automaticamente via token de sessão.
              </div>
            </section>

            {/* Periculosidade */}
            <section className="dce-panel p-5">
              <p className="dce-section-title">
                <Gavel size={14} /> Nível de Periculosidade
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {(['BAIXO', 'MODERADO', 'ALTO'] as NivelPericulosidade[]).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPericulosidade(n)}
                    className={`rounded-md border px-3 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                      periculosidade === n
                        ? 'border-gold-500/50 bg-gold-500/15 text-gold-200'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {n === 'BAIXO' ? '🟢 Baixo' : n === 'MODERADO' ? '🟡 Moderado' : '🔴 Alto'}
                  </button>
                ))}
              </div>
            </section>

            {/* Código Penal */}
            <section className="dce-panel p-5">
              <p className="dce-section-title mb-1">
                <Gavel size={14} /> Código Penal — Artigos Cometidos
              </p>
              <p className="mb-4 text-xs text-slate-500">
                Selecione todos os crimes aplicáveis. Os totais são calculados em tempo real.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {artigos.map((a) => {
                  const ativo = selecionados.includes(a.id)
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggle(a.id)}
                      className={`flex items-start gap-3 rounded-md border p-3 text-left transition ${
                        ativo
                          ? 'border-gold-500/50 bg-gold-500/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${
                          ativo ? 'border-gold-500 bg-gold-500 text-navy-950' : 'border-white/20 text-transparent'
                        }`}
                      >
                        <Check size={13} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="font-mono text-xs text-gold-300">{a.artigo}</span>
                          <span className="text-[0.68rem] text-slate-400">{mesesParaTexto(a.tempoMeses)}</span>
                        </span>
                        <span className="mt-0.5 block text-sm font-medium text-slate-100">{a.crime}</span>
                        <span className="mt-1 flex flex-wrap gap-2 text-[0.68rem] text-slate-500">
                          <span>Multa {formatBRL(a.valorMulta)}</span>
                          {a.tornozeleira && <span className="text-amber-400">• Tornozeleira</span>}
                          {!a.permiteFianca && <span className="text-red-400">• Inafiançável</span>}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Painel lateral */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <PenalCalculadora artigosSelecionados={artigosSelecionados} />

            {erro && <InlineError>{erro}</InlineError>}

            <button type="submit" disabled={salvando} className="dce-btn-primary w-full !py-3">
              <FilePlus2 size={18} />
              {salvando ? 'Registrando...' : 'Registrar Entrada no Presídio'}
            </button>
            <button type="button" onClick={() => navigate('/painel')} className="dce-btn-ghost w-full">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
