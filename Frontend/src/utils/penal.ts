import type { CodigoPenalArtigo, CrimeCometido, PenalCalcResult } from '@/types'

/** Calcula tempo, multa, tornozeleira, fiança e previsão de soltura a partir dos artigos marcados. */
export function calcularPena(
  artigosSelecionados: CodigoPenalArtigo[],
  dataEntrada: Date = new Date(),
): PenalCalcResult {
  const crimes: CrimeCometido[] = artigosSelecionados.map((a) => ({
    artigoId: a.id,
    artigo: a.artigo,
    crime: a.crime,
    tempoMeses: a.tempoMeses,
    valorMulta: a.valorMulta,
    valorFianca: a.valorFianca,
    tornozeleira: a.tornozeleira,
    permiteFianca: a.permiteFianca,
  }))

  const tempoTotalMeses = crimes.reduce((s, c) => s + c.tempoMeses, 0)
  const valorMultaTotal = crimes.reduce((s, c) => s + c.valorMulta, 0)
  const exigeTornozeleira = crimes.some((c) => c.tornozeleira)
  const permiteFianca = crimes.every((c) => c.permiteFianca) && crimes.length > 0
  const valorFianca = crimes.reduce((s, c) => s + (c.permiteFianca ? c.valorFianca : 0), 0)
  const previsaoSoltura = new Date(dataEntrada.getTime() + tempoTotalMeses * 30 * 86400000)

  return {
    crimes,
    tempoTotalMeses,
    valorMultaTotal,
    exigeTornozeleira,
    permiteFianca,
    valorFianca,
    previsaoSoltura,
  }
}
