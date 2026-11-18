// Formatadores e utilitários de apresentação

export function formatBRL(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(iso: string | Date | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Converte meses de pena em texto legível (ex.: "1 ano e 3 meses"). */
export function mesesParaTexto(meses: number): string {
  if (!meses || meses <= 0) return '0 meses'
  const anos = Math.floor(meses / 12)
  const resto = meses % 12
  const partes: string[] = []
  if (anos > 0) partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`)
  if (resto > 0) partes.push(`${resto} ${resto === 1 ? 'mês' : 'meses'}`)
  return partes.join(' e ')
}

export interface TempoRestante {
  texto: string
  dias: number
  vencido: boolean
  percentualDecorrido: number
}

/** Calcula tempo restante até a previsão de soltura. */
export function tempoRestante(
  previsaoSoltura: string | null | undefined,
  dataEntrada?: string | null,
): TempoRestante {
  if (!previsaoSoltura) return { texto: '—', dias: 0, vencido: false, percentualDecorrido: 100 }
  const fim = new Date(previsaoSoltura).getTime()
  const inicio = dataEntrada ? new Date(dataEntrada).getTime() : Date.now()
  const agora = Date.now()
  const dias = Math.ceil((fim - agora) / 86400000)
  const total = Math.max(fim - inicio, 1)
  const decorrido = Math.min(Math.max(agora - inicio, 0), total)
  const percentualDecorrido = Math.round((decorrido / total) * 100)

  if (dias <= 0) return { texto: 'Pena cumprida', dias: 0, vencido: true, percentualDecorrido: 100 }

  const anos = Math.floor(dias / 365)
  const meses = Math.floor((dias % 365) / 30)
  const diasResto = dias % 30
  const partes: string[] = []
  if (anos > 0) partes.push(`${anos}a`)
  if (meses > 0) partes.push(`${meses}m`)
  if (anos === 0 && diasResto > 0) partes.push(`${diasResto}d`)
  return { texto: partes.join(' ') || `${dias}d`, dias, vencido: false, percentualDecorrido }
}

export function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export function gerarId(): number {
  return Math.floor(Date.now() + Math.random() * 1000)
}
