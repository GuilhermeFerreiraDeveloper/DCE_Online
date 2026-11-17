import { iniciais } from '@/utils/format'

interface AvatarProps {
  nome: string
  /** Foto de perfil (Base64/data URL ou link). Quando ausente, exibe as iniciais. */
  fotoUrl?: string | null
  /** Diâmetro em pixels. */
  size?: number
  className?: string
}

/** Foto de perfil circular do oficial; recorre às iniciais quando não há foto. */
export function Avatar({ nome, fotoUrl, size = 36, className = '' }: AvatarProps) {
  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={nome}
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-full border border-gold-500/40 object-cover ${className}`}
      />
    )
  }

  return (
    <span
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={`grid shrink-0 place-items-center rounded-full border border-gold-500/40 bg-navy-950 font-display font-semibold text-gold-300 ${className}`}
    >
      {iniciais(nome)}
    </span>
  )
}
