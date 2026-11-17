import type {
  CodigoPenalArtigo,
  Detento,
  Estatisticas,
  FichaPublica,
  HistoricoComportamento,
  LogAuditoria,
  LoginResponse,
  NivelPericulosidade,
  Oficial,
  VerificacaoPassaporte,
} from '@/types'
import { useConnectionStore } from '@/store/connection'
import * as demo from './demoStore'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5080/api').replace(/\/$/, '')

let authToken: string | null = null
export function setAuthToken(token: string | null) {
  authToken = token
}

export class ApiHttpError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  const res = await fetch(`${API_URL}${path}`, { ...init, headers })
  const raw = await res.text()
  const data = raw ? JSON.parse(raw) : null

  if (!res.ok) {
    const msg = (data && (data.mensagem || data.erro || data.message)) || `Erro ${res.status}`
    throw new ApiHttpError(msg, res.status)
  }
  return data as T
}

/**
 * Executa a chamada real; se a API estiver inacessível (erro de rede),
 * ativa o MODO DEMONSTRAÇÃO e responde com os dados simulados.
 * Erros HTTP reais (401/403/400...) são propagados normalmente.
 */
async function withFallback<T>(real: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    const result = await real()
    useConnectionStore.getState().setDemoMode(false)
    return result
  } catch (err) {
    if (err instanceof ApiHttpError) throw err
    // Falha de rede / backend desligado → modo demonstração
    useConnectionStore.getState().setDemoMode(true)
    useConnectionStore.getState().setMotivo('API .NET inacessível')
    return fallback()
  }
}

const corpoJson = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) })

export const dceApi = {
  // ----------------------------- Autenticação -----------------------------
  login: (identificador: string, senha: string): Promise<LoginResponse> =>
    withFallback(
      () => http<LoginResponse>('/auth/login', corpoJson({ identificador, senha })),
      () => demo.demoLogin(identificador, senha),
    ),

  register: (payload: {
    passaporte: string
    nome: string
    email: string
    departamento: string
    senha: string
  }): Promise<{ ok: boolean }> =>
    withFallback(
      () => http<{ ok: boolean }>('/auth/register', corpoJson(payload)),
      () => demo.demoRegister(payload),
    ),

  alterarSenha: (
    payload: { senhaAtual: string; novaSenha: string },
    oficial: Oficial,
  ): Promise<{ ok: boolean }> =>
    withFallback(
      () => http<{ ok: boolean }>('/auth/senha', { ...corpoJson(payload), method: 'PUT' }),
      () => demo.demoAlterarSenha(oficial, payload.senhaAtual, payload.novaSenha),
    ),

  atualizarPerfil: (payload: { fotoUrl: string | null }, oficial: Oficial): Promise<Oficial> =>
    withFallback(
      () => http<Oficial>('/auth/perfil', { ...corpoJson(payload), method: 'PUT' }),
      () => demo.demoAtualizarPerfil(oficial, payload.fotoUrl),
    ),

  // --------------------------- Consulta pública ---------------------------
  fichaPublica: (passaporte: string): Promise<FichaPublica> =>
    withFallback(
      () => http<FichaPublica>(`/public/ficha/${encodeURIComponent(passaporte)}`),
      () => demo.demoFichaPublica(passaporte),
    ),

  // -------------------------------- Detentos -------------------------------
  listarDetentos: (busca = ''): Promise<Detento[]> =>
    withFallback(
      () => http<Detento[]>(`/detentos?busca=${encodeURIComponent(busca)}`),
      () => demo.demoListarDetentos(busca),
    ),

  obterDetento: (id: number): Promise<Detento | null> =>
    withFallback(
      () => http<Detento>(`/detentos/${id}`),
      () => demo.demoObterDetento(id),
    ),

  verificarPassaporte: (passaporte: string): Promise<VerificacaoPassaporte> =>
    withFallback(
      () => http<VerificacaoPassaporte>(`/detentos/verificar-passaporte/${encodeURIComponent(passaporte)}`),
      () => demo.demoVerificarPassaporte(passaporte),
    ),

  criarDetento: (
    payload: {
      passaporteDetento: string
      nomeDetento: string
      fotoUrl: string | null
      artigoIds: number[]
      policialCondutor: string
      nivelPericulosidade: NivelPericulosidade
    },
    oficial: { id: number; nome: string },
  ): Promise<Detento> =>
    withFallback(
      () => http<Detento>('/detentos', corpoJson(payload)),
      () => demo.demoCriarDetento(payload, oficial),
    ),

  atualizarDetento: (
    id: number,
    payload: Partial<Detento>,
    oficial: { id: number; nome: string },
  ): Promise<Detento | null> =>
    withFallback(
      () => http<Detento>(`/detentos/${id}`, { ...corpoJson(payload), method: 'PUT' }),
      () => demo.demoAtualizarDetento(id, payload, oficial),
    ),

  darBaixa: (id: number, motivo: string, oficial: { id: number; nome: string }): Promise<Detento | null> =>
    withFallback(
      () => http<Detento>(`/detentos/${id}/baixa`, corpoJson({ motivo })),
      () => demo.demoDarBaixa(id, motivo, oficial),
    ),

  excluirDetento: (id: number, oficial: { id: number; nome: string }): Promise<{ ok: boolean }> =>
    withFallback(
      () => http<{ ok: boolean }>(`/detentos/${id}`, { method: 'DELETE' }),
      () => demo.demoExcluirDetento(id, oficial),
    ),

  // --------------------- Comportamento / Solitária ------------------------
  registrarComportamento: (
    detentoId: number,
    payload: {
      tipoRegistro: HistoricoComportamento['tipoRegistro']
      nivelPericulosidade: NivelPericulosidade
      emSolitaria: boolean
      motivoSolitaria?: string | null
      terminoSolitaria?: string | null
      descricao?: string | null
    },
    oficial: { id: number; nome: string },
  ): Promise<HistoricoComportamento | null> =>
    withFallback(
      () => http<HistoricoComportamento>(`/detentos/${detentoId}/comportamento`, corpoJson(payload)),
      () => demo.demoRegistrarComportamento(detentoId, payload, oficial),
    ),

  obterHistorico: (detentoId: number): Promise<HistoricoComportamento[]> =>
    withFallback(
      () => http<HistoricoComportamento[]>(`/detentos/${detentoId}/historico`),
      () => demo.demoObterHistorico(detentoId),
    ),

  // -------------------------------- Oficiais -------------------------------
  listarOficiais: (): Promise<Oficial[]> =>
    withFallback(() => http<Oficial[]>('/oficiais'), () => demo.demoListarOficiais()),

  listarPendentes: (): Promise<Oficial[]> =>
    withFallback(() => http<Oficial[]>('/oficiais/pendentes'), () => demo.demoListarPendentes()),

  aprovarOficial: (
    id: number,
    dados: { patente: string; nivelAcesso: number; departamento: string },
    aprovador: { id: number; nome: string },
  ): Promise<Oficial | null> =>
    withFallback(
      () => http<Oficial>(`/oficiais/${id}/aprovar`, corpoJson(dados)),
      () => demo.demoAprovarOficial(id, dados, aprovador),
    ),

  recusarOficial: (id: number, aprovador: { id: number; nome: string }): Promise<{ ok: boolean }> =>
    withFallback(
      () => http<{ ok: boolean }>(`/oficiais/${id}/recusar`, { method: 'POST' }),
      () => demo.demoRecusarOficial(id, aprovador),
    ),

  atualizarOficial: (
    id: number,
    patch: Partial<Pick<Oficial, 'patente' | 'nivelAcesso' | 'statusConta'>>,
    autor: { id: number; nome: string },
  ): Promise<Oficial | null> =>
    withFallback(
      () => http<Oficial>(`/oficiais/${id}`, { ...corpoJson(patch), method: 'PUT' }),
      () => demo.demoAtualizarOficial(id, patch, autor),
    ),

  excluirOficial: (id: number, autor: { id: number; nome: string }): Promise<{ ok: boolean }> =>
    withFallback(
      () => http<{ ok: boolean }>(`/oficiais/${id}`, { method: 'DELETE' }),
      () => demo.demoExcluirOficial(id, autor),
    ),

  // ------------------------------ Código Penal ----------------------------
  listarCodigoPenal: (): Promise<CodigoPenalArtigo[]> =>
    withFallback(() => http<CodigoPenalArtigo[]>('/codigo-penal'), () => demo.demoListarCodigoPenal()),

  criarArtigo: (
    payload: Omit<CodigoPenalArtigo, 'id'>,
    autor: { id: number; nome: string },
  ): Promise<CodigoPenalArtigo> =>
    withFallback(
      () => http<CodigoPenalArtigo>('/codigo-penal', corpoJson(payload)),
      () => demo.demoCriarArtigo(payload, autor),
    ),

  atualizarArtigo: (
    id: number,
    payload: Omit<CodigoPenalArtigo, 'id'>,
    autor: { id: number; nome: string },
  ): Promise<CodigoPenalArtigo | null> =>
    withFallback(
      () => http<CodigoPenalArtigo>(`/codigo-penal/${id}`, { ...corpoJson(payload), method: 'PUT' }),
      () => demo.demoAtualizarArtigo(id, payload, autor),
    ),

  excluirArtigo: (id: number, autor: { id: number; nome: string }): Promise<{ ok: boolean }> =>
    withFallback(
      () => http<{ ok: boolean }>(`/codigo-penal/${id}`, { method: 'DELETE' }),
      () => demo.demoExcluirArtigo(id, autor),
    ),

  // ------------------------ Auditoria & Estatísticas ----------------------
  listarAuditoria: (): Promise<LogAuditoria[]> =>
    withFallback(() => http<LogAuditoria[]>('/auditoria'), () => demo.demoListarAuditoria()),

  estatisticas: (): Promise<Estatisticas> =>
    withFallback(() => http<Estatisticas>('/estatisticas'), () => demo.demoEstatisticas()),
}

export { resetDemoDB } from './demoStore'
