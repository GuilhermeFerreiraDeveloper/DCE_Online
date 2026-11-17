import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  ClipboardPaste,
  FilePlus2,
  Gavel,
  Image,
  RefreshCw,
  ShieldAlert,
  ShieldPlus,
  Upload,
  UserRound,
  X,
} from 'lucide-react'
import { Field } from '@/components/ui/Field'
import { InlineError, Spinner } from '@/components/ui/Feedback'
import { PenalCalculadora } from '@/components/detento/PenalCalculadora'
import { dceApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { formatBRL, mesesParaTexto } from '@/utils/format'
import type { CodigoPenalArtigo, NivelPericulosidade, VerificacaoPassaporte } from '@/types'

export default function NovoDetento() {
  const oficial = useAuthStore((s) => s.oficial)
  const navigate = useNavigate()
  const inputArquivoRef = useRef<HTMLInputElement>(null)

  const [artigos, setArtigos] = useState<CodigoPenalArtigo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [selecionados, setSelecionados] = useState<number[]>([])
  const [form, setForm] = useState({
    nomeDetento: '',
    passaporteDetento: '',
    fotoUrl: '',
    policialCondutor: oficial ? `${oficial.patente} ${oficial.nome}` : '',
  })
  const [periculosidade, setPericulosidade] = useState<NivelPericulosidade>('MODERADO')
  const [verificacao, setVerificacao] = useState<VerificacaoPassaporte | null>(null)
  const [verificando, setVerificando] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const bloqueado = !!verificacao?.emCustodia

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

  /** Lê um arquivo/imagem e converte para Base64 (data URL) para pré-visualização. */
  const aplicarImagem = useCallback((arquivo: File) => {
    if (!arquivo.type.startsWith('image/')) return
    const leitor = new FileReader()
    leitor.onload = () => {
      const resultado = String(leitor.result)
      setForm((f) => ({ ...f, fotoUrl: resultado }))
    }
    leitor.readAsDataURL(arquivo)
  }, [])

  // Colar print da área de transferência (Windows + Shift + S → Ctrl + V).
  useEffect(() => {
    const aoColar = (e: ClipboardEvent) => {
      const itens = e.clipboardData?.items
      if (!itens) return
      const itemImagem = Array.from(itens).find((i) => i.type.startsWith('image/'))
      if (!itemImagem) return
      const arquivo = itemImagem.getAsFile()
      if (!arquivo) return
      e.preventDefault()
      aplicarImagem(arquivo)
    }
    window.addEventListener('paste', aoColar)
    return () => window.removeEventListener('paste', aoColar)
  }, [aplicarImagem])

  const artigosSelecionados = useMemo(
    () => artigos.filter((a) => selecionados.includes(a.id)),
    [artigos, selecionados],
  )

  const toggle = (id: number) =>
    setSelecionados((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const verificar = async () => {
    const passaporte = form.passaporteDetento.trim()
    if (!passaporte) return
    setVerificando(true)
    setErro('')
    try {
      const resultado = await dceApi.verificarPassaporte(passaporte)
      setVerificacao(resultado)
      // Reincidente em liberdade: preenche nome e mugshot anteriores automaticamente.
      if (resultado.existe && !resultado.emCustodia) {
        setForm((f) => ({
          ...f,
          nomeDetento: f.nomeDetento || resultado.nome || '',
          fotoUrl: f.fotoUrl || resultado.fotoUrl || '',
        }))
      }
    } catch {
      setErro('Não foi possível verificar o passaporte. Tente novamente.')
    } finally {
      setVerificando(false)
    }
  }

  const submeter = async (e: FormEvent) => {
    e.preventDefault()
    setErro('')
    if (!oficial) return
    if (bloqueado) {
      return setErro('Este cidadão já está cumprindo pena (EM_CUSTODIA). Dê baixa na ficha ativa antes de novo registro.')
    }
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

  const fotoEhBase64 = form.fotoUrl.startsWith('data:')

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
                <Field label="Passaporte / ID" hint="Ao sair do campo, verificamos se já existe ficha.">
                  <div className="flex gap-2">
                    <input
                      value={form.passaporteDetento}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, passaporteDetento: e.target.value }))
                        setVerificacao(null)
                      }}
                      onBlur={verificar}
                      className="dce-input font-mono"
                      placeholder="Ex.: 2001"
                      inputMode="numeric"
                      required
                    />
                    <button
                      type="button"
                      onClick={verificar}
                      disabled={verificando || !form.passaporteDetento.trim()}
                      className="dce-btn-ghost shrink-0 !px-3"
                      title="Verificar passaporte"
                    >
                      {verificando ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    </button>
                  </div>
                </Field>

                <Field label="Órgão / Policial Condutor" hint="Preenchido automaticamente com o oficial logado.">
                  <input
                    value={form.policialCondutor}
                    onChange={(e) => setForm((f) => ({ ...f, policialCondutor: e.target.value }))}
                    className="dce-input"
                    placeholder="Ex.: PM — 3º Batalhão"
                    readOnly
                  />
                </Field>

                {/* Resultado da verificação */}
                {verificacao?.emCustodia && (
                  <div className="sm:col-span-2 flex items-start gap-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-3">
                    <ShieldAlert size={18} className="mt-0.5 shrink-0 text-red-300" />
                    <div className="text-xs text-red-100">
                      <p className="text-sm font-semibold text-red-200">Cidadão já está preso (EM CUSTÓDIA)</p>
                      <p className="mt-0.5 text-red-200/80">
                        Já existe uma ficha ativa para <strong>{verificacao.nome}</strong>. Não é possível abrir uma
                        nova entrada enquanto ele estiver cumprindo pena.
                      </p>
                      {verificacao.ultimaFichaId && (
                        <Link
                          to={`/painel/detento/${verificacao.ultimaFichaId}`}
                          className="mt-2 inline-block font-semibold text-gold-300 hover:text-gold-200"
                        >
                          Abrir ficha ativa →
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {verificacao?.existe && !verificacao.emCustodia && (
                  <div className="sm:col-span-2 flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-3">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-300" />
                    <div className="text-xs text-amber-100">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-amber-200">
                        Reincidente
                        <span className="dce-tag border-amber-500/40 bg-amber-500/15 text-amber-200">
                          {verificacao.totalPassagens} passagem(ns)
                        </span>
                      </p>
                      <p className="mt-0.5 text-amber-200/80">
                        Cidadão com histórico anterior. Nome e mugshot preenchidos automaticamente — revise antes de
                        registrar.
                      </p>
                    </div>
                  </div>
                )}

                {verificacao && !verificacao.existe && (
                  <div className="sm:col-span-2 flex items-center gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
                    <BadgeCheck size={18} className="shrink-0 text-emerald-300" />
                    <p className="text-xs text-emerald-100">
                      <strong className="text-emerald-200">Réu primário</strong> — nenhuma ficha anterior para este
                      passaporte.
                    </p>
                  </div>
                )}

                {/* Mugshot */}
                <Field
                  label="Mugshot do Detento"
                  className="sm:col-span-2"
                  hint="Cole um print (Ctrl + V), envie um arquivo ou informe um link."
                >
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="grid h-28 w-24 shrink-0 place-items-center overflow-hidden rounded-md border border-white/10 bg-navy-950/60">
                      {form.fotoUrl ? (
                        <img src={form.fotoUrl} alt="Mugshot do detento" className="h-full w-full object-cover" />
                      ) : (
                        <Image size={22} className="text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => inputArquivoRef.current?.click()}
                          className="dce-btn-ghost !py-2 text-xs"
                        >
                          <Upload size={14} /> Enviar arquivo
                        </button>
                        {form.fotoUrl && (
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, fotoUrl: '' }))}
                            className="dce-btn-ghost !py-2 text-xs !text-red-300 hover:!bg-red-500/10"
                          >
                            <X size={14} /> Remover
                          </button>
                        )}
                      </div>
                      <input
                        ref={inputArquivoRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const arquivo = e.target.files?.[0]
                          if (arquivo) aplicarImagem(arquivo)
                          e.target.value = ''
                        }}
                      />
                      <div className="relative">
                        <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          value={fotoEhBase64 ? '' : form.fotoUrl}
                          onChange={(e) => setForm((f) => ({ ...f, fotoUrl: e.target.value }))}
                          disabled={fotoEhBase64}
                          className="dce-input pl-9 text-xs disabled:opacity-60"
                          placeholder={fotoEhBase64 ? 'Imagem colada (Base64) anexada' : 'https://...'}
                        />
                      </div>
                      <p className="flex items-center gap-1.5 text-[0.68rem] text-slate-500">
                        <ClipboardPaste size={12} /> Dica: use Windows + Shift + S e depois Ctrl + V para colar o print.
                      </p>
                    </div>
                  </div>
                </Field>

                <Field label="Nome Completo (RP)" className="sm:col-span-2">
                  <input
                    value={form.nomeDetento}
                    onChange={(e) => setForm((f) => ({ ...f, nomeDetento: e.target.value }))}
                    className="dce-input"
                    placeholder="Nome e sobrenome do detento"
                    required
                  />
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

            <button type="submit" disabled={salvando || bloqueado} className="dce-btn-primary w-full !py-3">
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
