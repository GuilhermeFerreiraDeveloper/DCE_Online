// Tipos compartilhados do sistema DCE

export type StatusConta = 'PENDENTE' | 'ATIVO' | 'BLOQUEADO'
export type NivelAcesso = 1 | 2 | 3
export type StatusPrisao = 'EM_CUSTODIA' | 'LIBERADO' | 'FORAGIDO'
export type TipoRegistro = 'BOM_COMPORTAMENTO' | 'MAU_COMPORTAMENTO' | 'SOLITARIA'
export type NivelPericulosidade = 'BAIXO' | 'MODERADO' | 'ALTO'

export const PATENTES_NIVEL_2 = [
  'Coronel',
  'Tenente Coronel',
  'Major',
  'Capitão',
  '1º Tenente',
  '2º Tenente',
  'Sub.Tenente',
  'Supervisor do Estado',
] as const

export const PATENTES_NIVEL_3 = [
  'Agente do Estado',
  '1º Sargento',
  '2º Sargento',
  'Cabo',
  '1º Soldado',
  '2º Soldado',
  'Recruta',
] as const

export const PATENTES_NIVEL_1 = ['COMANDO', 'Diretor Geral', 'Diretor Executivo'] as const

export const TODAS_PATENTES = [
  ...PATENTES_NIVEL_1,
  ...PATENTES_NIVEL_2,
  ...PATENTES_NIVEL_3,
] as const

export const DEPARTAMENTOS = [
  'Departamento de Polícia do Estado',
  'Departamento de Polícia de Vinewood',
  'Departamento de Polícia de Mission Row',
  'Departamento de Polícia de La Mesa',
  'Departamento de Polícia de Vespucci',
  'Departamento de Polícia do Norte',
  'Departamento de Polícia de Justiça',
  'Departamento de Custódia do Estado',
] as const

export interface Oficial {
  id: number
  passaporte: string
  nome: string
  email: string
  patente: string
  departamento: string
  nivelAcesso: NivelAcesso
  statusConta: StatusConta
  aprovadoPor: number | null
  criadoEm: string
}

export interface CodigoPenalArtigo {
  id: number
  artigo: string
  crime: string
  tornozeleira: boolean
  permiteFianca: boolean
  valorFianca: number
  tempoMeses: number
  valorMulta: number
  descricao: string
}

export interface CrimeCometido {
  artigoId: number
  artigo: string
  crime: string
  tempoMeses: number
  valorMulta: number
  valorFianca: number
  tornozeleira: boolean
  permiteFianca: boolean
}

export interface Detento {
  id: number
  passaporteDetento: string
  nomeDetento: string
  fotoUrl: string | null
  crimesCometidos: CrimeCometido[]
  tempoTotalMeses: number
  valorMultaTotal: number
  exigeTornozeleira: boolean
  permiteFianca: boolean
  statusPrisao: StatusPrisao
  policialCondutor: string | null
  oficialRegistrouId: number | null
  oficialRegistrouNome?: string | null
  dataEntrada: string
  previsaoSoltura: string | null
  nivelPericulosidade?: NivelPericulosidade
  emSolitaria?: boolean
  motivoSolitaria?: string | null
  terminoSolitaria?: string | null
}

export interface HistoricoComportamento {
  id: number
  detentoId: number
  tipoRegistro: TipoRegistro
  nivelPericulosidade: NivelPericulosidade | null
  emSolitaria: boolean
  motivoSolitaria: string | null
  terminoSolitaria: string | null
  descricao: string | null
  oficialResponsavelId: number | null
  oficialResponsavelNome?: string | null
  criadoEm: string
}

export interface LogAuditoria {
  id: number
  oficialId: number | null
  oficialNome?: string | null
  acao: string
  entidade: string
  entidadeId: number | null
  detalhe: string | null
  criadoEm: string
}

export interface Estatisticas {
  totalDetentos: number
  emCustodia: number
  liberados: number
  foragidos: number
  emSolitaria: number
  exigeTornozeleira: number
  oficiaisAtivos: number
  oficiaisPendentes: number
  totalArtigos: number
  totalOcorrencias: number
}

export interface LoginResponse {
  token: string
  oficial: Oficial
}

export interface PassagemPublica {
  id: number
  artigo: string
  crime: string
  tempoMeses: number
  multa: number
  dataEntrada: string
  statusPrisao: StatusPrisao
}

export interface FichaPublica {
  encontrado: boolean
  nome?: string
  passaporte?: string
  statusAtual?: 'EM_CUSTODIA' | 'LIBERADO' | 'FORAGIDO' | 'TORNOZELEIRA'
  fotoUrl?: string | null
  emSolitaria?: boolean
  nivelPericulosidade?: NivelPericulosidade
  totalMeses?: number
  totalMulta?: number
  passagens?: PassagemPublica[]
}

export interface PenalCalcResult {
  crimes: CrimeCometido[]
  tempoTotalMeses: number
  valorMultaTotal: number
  exigeTornozeleira: boolean
  permiteFianca: boolean
  valorFianca: number
  previsaoSoltura: Date
}
