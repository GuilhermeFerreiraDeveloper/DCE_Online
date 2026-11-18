import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Camera, ClipboardPaste, KeyRound, Save, Trash2, Upload, UserCog, Award } from 'lucide-react'
import { Field } from '@/components/ui/Field'
import { InlineError, InlineSuccess } from '@/components/ui/Feedback'
import { dceApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { iniciais, formatDateTime } from '@/utils/format'

export default function MinhaConta() {
  const oficial = useAuthStore((s) => s.oficial)
  const atualizarOficial = useAuthStore((s) => s.atualizarOficial)
  const inputArquivoRef = useRef<HTMLInputElement>(null)

  const [fotoPreview, setFotoPreview] = useState(oficial?.fotoUrl ?? '')
  const [salvandoFoto, setSalvandoFoto] = useState(false)
  const [msgFoto, setMsgFoto] = useState('')
  const [erroFoto, setErroFoto] = useState('')

  const [senha, setSenha] = useState({ atual: '', nova: '', confirmar: '' })
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [msgSenha, setMsgSenha] = useState('')
  const [erroSenha, setErroSenha] = useState('')

  /** Lê um arquivo/imagem e converte para Base64 (data URL) para pré-visualização. */
  const aplicarImagem = useCallback((arquivo: File) => {
    if (!arquivo.type.startsWith('image/')) return
    const leitor = new FileReader()
    leitor.onload = () => {
      setFotoPreview(String(leitor.result))
      setMsgFoto('')
      setErroFoto('')
    }
    leitor.readAsDataURL(arquivo)
  }, [])

  // Colar foto da área de transferência (Windows + Shift + S → Ctrl + V).
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

  const salvarFoto = async (valor: string | null) => {
    if (!oficial) return
    setSalvandoFoto(true)
    setMsgFoto('')
    setErroFoto('')
    try {
      const atualizado = await dceApi.atualizarPerfil({ fotoUrl: valor }, oficial)
      atualizarOficial({ fotoUrl: atualizado.fotoUrl ?? null })
      setFotoPreview(atualizado.fotoUrl ?? '')
      setMsgFoto(valor ? 'Foto de perfil atualizada com sucesso.' : 'Foto de perfil removida.')
    } catch (err) {
      setErroFoto(err instanceof Error ? err.message : 'Não foi possível salvar a foto.')
    } finally {
      setSalvandoFoto(false)
    }
  }

  const alterarSenha = async (e: FormEvent) => {
    e.preventDefault()
    if (!oficial) return
    setMsgSenha('')
    setErroSenha('')

    if (senha.nova.length < 6) return setErroSenha('A nova senha precisa ter no mínimo 6 caracteres.')
    if (senha.nova !== senha.confirmar) return setErroSenha('A confirmação não corresponde à nova senha.')

    setSalvandoSenha(true)
    try {
      await dceApi.alterarSenha({ senhaAtual: senha.atual, novaSenha: senha.nova }, oficial)
      setSenha({ atual: '', nova: '', confirmar: '' })
      setMsgSenha('Senha alterada com sucesso.')
    } catch (err) {
      setErroSenha(err instanceof Error ? err.message : 'Não foi possível alterar a senha.')
    } finally {
      setSalvandoSenha(false)
    }
  }

  if (!oficial) return null

  return (
    <div className="space-y-6">
      <header>
        <p className="dce-section-title">
          <UserCog size={14} /> Área do Oficial
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-white">Minha Conta</h1>
        <p className="mt-1 text-sm text-slate-400">
          Gerencie sua foto de perfil e sua senha de acesso. A foto é opcional e pode ser definida a qualquer momento.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Foto de perfil */}
        <section className="dce-panel p-5">
          <p className="dce-section-title">
            <Camera size={14} /> Foto de Perfil
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Use uma foto de rosto. Cole um print (Windows + Shift + S → Ctrl + V) ou importe um arquivo do seu
            computador.
          </p>

          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <button
              type="button"
              onClick={() => inputArquivoRef.current?.click()}
              className="group relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-gold-500/40 bg-navy-950"
              title="Alterar foto"
            >
              {fotoPreview ? (
                <img src={fotoPreview} alt="Foto de perfil" className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center font-display text-4xl font-semibold text-gold-300">
                  {iniciais(oficial.nome)}
                </span>
              )}
              <span className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                <Camera size={22} className="text-white" />
              </span>
            </button>

            <div className="w-full space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => inputArquivoRef.current?.click()}
                  className="dce-btn-ghost !py-2 text-xs"
                >
                  <Upload size={14} /> Importar do PC
                </button>
                {fotoPreview && (
                  <button
                    type="button"
                    onClick={() => void salvarFoto(null)}
                    disabled={salvandoFoto}
                    className="dce-btn-ghost !py-2 text-xs !text-red-300 hover:!bg-red-500/10"
                  >
                    <Trash2 size={14} /> Remover
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
              <p className="flex items-center gap-1.5 text-[0.68rem] text-slate-500">
                <ClipboardPaste size={12} /> Dica: tire um print do seu rosto e cole aqui com Ctrl + V.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => void salvarFoto(fotoPreview.trim() || null)}
              disabled={salvandoFoto}
              className="dce-btn-primary w-full !py-2.5"
            >
              <Save size={16} /> {salvandoFoto ? 'Salvando...' : 'Salvar foto'}
            </button>
            {msgFoto && <InlineSuccess>{msgFoto}</InlineSuccess>}
            {erroFoto && <InlineError>{erroFoto}</InlineError>}
          </div>
        </section>

        {/* Trocar senha */}
        <section className="dce-panel p-5">
          <p className="dce-section-title">
            <KeyRound size={14} /> Trocar Senha
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Informe sua senha atual e escolha uma nova com no mínimo 6 caracteres.
          </p>

          <form onSubmit={alterarSenha} className="mt-5 space-y-4">
            <Field label="Senha atual">
              <input
                type="password"
                value={senha.atual}
                onChange={(e) => setSenha((s) => ({ ...s, atual: e.target.value }))}
                className="dce-input"
                autoComplete="current-password"
                required
              />
            </Field>
            <Field label="Nova senha">
              <input
                type="password"
                value={senha.nova}
                onChange={(e) => setSenha((s) => ({ ...s, nova: e.target.value }))}
                className="dce-input"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </Field>
            <Field label="Confirmar nova senha">
              <input
                type="password"
                value={senha.confirmar}
                onChange={(e) => setSenha((s) => ({ ...s, confirmar: e.target.value }))}
                className="dce-input"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </Field>

            {erroSenha && <InlineError>{erroSenha}</InlineError>}
            {msgSenha && <InlineSuccess>{msgSenha}</InlineSuccess>}

            <button type="submit" disabled={salvandoSenha} className="dce-btn-primary w-full !py-2.5">
              <KeyRound size={16} /> {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </section>
      </div>

      {/* CONDECORAÇÕES */}
      <div className="dce-panel p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold uppercase text-white">
          <Award size={20} className="text-gold-400" /> Medalhas e Condecorações
        </h2>
        <p className="mt-1 text-xs text-slate-500">Reconhecimento oficial por serviços prestados ao DCE.</p>
        
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {oficial.medalhas && oficial.medalhas.length > 0 ? (
            oficial.medalhas.map(m => (
              <div key={m.id} className="relative overflow-hidden rounded-lg border border-gold-500/10 bg-gold-500/5 p-4 transition hover:border-gold-500/30">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-navy-950 text-gold-400 shadow-inner">
                    <Award size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-white">{m.nomeMedalha}</h3>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-400 line-clamp-2">{m.descricao}</p>
                    <div className="mt-2 text-[9px] uppercase tracking-tighter text-gold-500/80">
                      Concedido por: {m.concedidoPorNome}
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t border-gold-500/10 pt-2 text-[8px] text-slate-500">
                  {formatDateTime(m.dataConcessao)}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-sm text-slate-500">
              Nenhuma condecoração registrada até o momento.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
