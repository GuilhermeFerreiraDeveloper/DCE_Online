import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Music2, Pause, Play, Radio, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'

interface Faixa {
  titulo: string
  artista: string
  src: string
}

/** Playlist da Rádio DCE — arquivos locais em /public/musicas/. */
const PLAYLIST: Faixa[] = [
  { titulo: 'Tema Oficial DCE', artista: 'DCE', src: '/musicas/DCE.mp3' },
  { titulo: 'Diário de um Detento', artista: "Racionais MC's", src: '/musicas/Diario de um Detento.m4a' },
  { titulo: 'Olhos Vermelhos', artista: 'guilhermetrae2', src: '/musicas/Olhos Vermelhos.mp3' },
]

function formatarTempo(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return '0:00'
  const min = Math.floor(segundos / 60)
  const seg = Math.floor(segundos % 60)
  return `${min}:${seg.toString().padStart(2, '0')}`
}

/**
 * Rádio interna flutuante do DCE. Inicia recolhida (apenas um ícone),
 * sorteia uma faixa ao abrir o site e continua tocando em segundo plano
 * mesmo ao navegar entre as páginas (componente montado globalmente).
 */
export function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  // Sorteia a faixa inicial para que cada abertura toque uma música diferente.
  const [indice, setIndice] = useState(() => Math.floor(Math.random() * PLAYLIST.length))
  const [tocando, setTocando] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [mudo, setMudo] = useState(false)
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState(false)
  const [atual, setAtual] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const falhasRef = useRef<Set<number>>(new Set())
  // Garante que a próxima faixa toque mesmo que o estado `tocando` tenha sido
  // reiniciado por um `onPause` disparado junto com o `onEnded` em alguns navegadores.
  const autoAvancoRef = useRef(false)

  const faixa = PLAYLIST[indice]

  // Mantém o volume do áudio sincronizado com a barra/mudo.
  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = mudo ? 0 : volume
  }, [volume, mudo])

  // Autoplay ao abrir o site: tenta tocar assim que o player monta e insiste
  // em cada foco/retorno à aba/primeira interação, até o navegador permitir.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    let encerrado = false

    const alvos: Array<[EventTarget, string]> = [
      [window, 'pointerdown'],
      [window, 'keydown'],
      [window, 'touchstart'],
      [window, 'focus'],
      [document, 'visibilitychange'],
    ]

    const limpar = () => {
      for (const [alvo, evento] of alvos) alvo.removeEventListener(evento, tentarTocar)
    }

    const tentarTocar = () => {
      if (encerrado || !audio.paused) return
      audio
        .play()
        .then(() => {
          if (encerrado) return
          setTocando(true)
          limpar()
        })
        .catch(() => {
          /* bloqueado pelo navegador: aguarda a próxima interação */
        })
    }

    for (const [alvo, evento] of alvos) alvo.addEventListener(evento, tentarTocar)
    tentarTocar()

    return () => {
      encerrado = true
      limpar()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ao trocar de faixa, recarrega a origem e retoma a reprodução se estava tocando
  // ou se o avanço foi automático (fim da faixa anterior).
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    setAtual(0)
    setDuracao(0)
    const tocar = autoAvancoRef.current || tocando
    autoAvancoRef.current = false
    if (tocar) {
      audio
        .play()
        .then(() => setTocando(true))
        .catch(() => setTocando(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice])

  const alternarReproducao = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      try {
        await audio.play()
        setTocando(true)
      } catch {
        setErro(true)
      }
    } else {
      audio.pause()
    }
  }

  const faixaAnterior = () => setIndice((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length)
  const proximaFaixa = () => setIndice((i) => (i + 1) % PLAYLIST.length)

  /**
   * Fim de faixa: marca o avanço como automático (para forçar o autoplay mesmo
   * que um `onPause` tenha zerado `tocando`) e passa para a próxima, voltando à
   * primeira após a última — playlist em loop contínuo.
   */
  const aoTerminarFaixa = () => {
    autoAvancoRef.current = true
    setIndice((i) => (i + 1) % PLAYLIST.length)
  }

  /** Se um arquivo falhar, pula automaticamente; só exibe erro se todos falharem. */
  const aoErro = () => {
    falhasRef.current.add(indice)
    if (falhasRef.current.size >= PLAYLIST.length) {
      setErro(true)
      setTocando(false)
      return
    }
    let proximo = (indice + 1) % PLAYLIST.length
    let guarda = 0
    while (falhasRef.current.has(proximo) && guarda < PLAYLIST.length) {
      proximo = (proximo + 1) % PLAYLIST.length
      guarda++
    }
    autoAvancoRef.current = true
    setIndice(proximo)
  }

  const percentual = duracao > 0 ? Math.min(100, (atual / duracao) * 100) : 0

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden">
      <audio
        ref={audioRef}
        src={faixa.src}
        preload="auto"
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
        onEnded={aoTerminarFaixa}
        onTimeUpdate={(e) => setAtual(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuracao(e.currentTarget.duration)}
        onError={aoErro}
      />

      {aberto ? (
        <div className="w-72 animate-fade-up rounded-lg border border-gold-500/25 bg-navy-900/95 shadow-panel backdrop-blur-md">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
            <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-400/90">
              <Radio size={13} className={tocando ? 'animate-pulse-alert' : ''} />
              Rádio DCE
            </p>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="rounded p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Minimizar rádio"
            >
              <ChevronDown size={15} />
            </button>
          </div>

          {/* Faixa atual */}
          <div className="flex items-center gap-3 px-3 py-2.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-gold-500/30 bg-navy-950 text-gold-400">
              <Music2 size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{faixa.titulo}</p>
              <p className="truncate text-[0.7rem] uppercase tracking-wider text-gold-400/70">{faixa.artista}</p>
            </div>
          </div>

          {/* Progresso */}
          <div className="px-3">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gold-500 transition-[width] duration-300" style={{ width: `${percentual}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[0.62rem] font-mono text-slate-500">
              <span>{formatarTempo(atual)}</span>
              <span>{formatarTempo(duracao)}</span>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-center gap-2 px-3 py-2.5">
            <button
              type="button"
              onClick={faixaAnterior}
              className="rounded-md p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
              aria-label="Faixa anterior"
            >
              <SkipBack size={16} />
            </button>
            <button
              type="button"
              onClick={alternarReproducao}
              className="grid h-10 w-10 place-items-center rounded-full bg-gold-500 text-navy-950 transition hover:bg-gold-400 hover:shadow-gold active:translate-y-px"
              aria-label={tocando ? 'Pausar' : 'Reproduzir'}
            >
              {tocando ? <Pause size={18} /> : <Play size={18} className="translate-x-px" />}
            </button>
            <button
              type="button"
              onClick={proximaFaixa}
              className="rounded-md p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
              aria-label="Próxima faixa"
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 border-t border-white/5 px-3 py-2">
            <button
              type="button"
              onClick={() => setMudo((m) => !m)}
              className="shrink-0 text-slate-400 transition hover:text-white"
              aria-label={mudo ? 'Ativar som' : 'Silenciar'}
            >
              {mudo || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={mudo ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value))
                setMudo(false)
              }}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/15 accent-gold-500"
              aria-label="Volume"
            />
          </div>

          {/* Playlist */}
          <div className="border-t border-white/5 px-3 py-2">
            <ul className="space-y-0.5">
              {PLAYLIST.map((f, i) => (
                <li key={f.src}>
                  <button
                    type="button"
                    onClick={() => setIndice(i)}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition ${
                      i === indice ? 'bg-gold-500/10 text-gold-200' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="w-4 shrink-0 text-center font-mono text-[0.62rem] text-slate-500">
                      {i === indice && tocando ? '▶' : i + 1}
                    </span>
                    <span className="truncate">{f.titulo}</span>
                  </button>
                </li>
              ))}
            </ul>
            {erro && (
              <p className="mt-1.5 px-2 text-[0.62rem] leading-snug text-red-300/90">
                Áudio indisponível. Confirme os arquivos em <span className="font-mono">/public/musicas/</span>.
              </p>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="relative grid h-12 w-12 place-items-center rounded-full border border-gold-500/40 bg-navy-900/90 text-gold-400 shadow-gold backdrop-blur-md transition hover:bg-navy-800"
          aria-label="Abrir Rádio DCE"
          title="Rádio DCE"
        >
          {tocando ? <Radio size={20} className="animate-pulse-alert" /> : <Music2 size={20} />}
          {tocando && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold-400 ring-2 ring-navy-900" />
          )}
        </button>
      )}
    </div>
  )
}
