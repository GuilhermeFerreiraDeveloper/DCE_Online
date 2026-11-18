import type {
  CodigoPenalArtigo,
  Detento,
  Estatisticas,
  FichaPublica,
  HistoricoComportamento,
  HistoricoFichas,
  LogAuditoria,
  NivelPericulosidade,
  Oficial,
  VerificacaoPassaporte,
  Aviso,
  ChatMessage,
  Medalha,
  RegistroPonto,
  RankingPonto,
  Foragido,
} from '@/types'
import { gerarId } from '@/utils/format'
import { calcularPena } from '@/utils/penal'
import {
  DEMO_CODIGO_PENAL,
  DEMO_DETENTOS,
  DEMO_HISTORICO,
  DEMO_LOGS,
  DEMO_OFICIAIS,
  DEMO_SENHAS,
} from './demoData'

// ============================================================================
// MODO DEMONSTRAÇÃO — banco em memória com persistência em localStorage
// ============================================================================

interface DemoDB {
  oficiais: Oficial[]
  detentos: Detento[]
  historico: HistoricoComportamento[]
  logs: LogAuditoria[]
  codigoPenal: CodigoPenalArtigo[]
  senhas: Record<string, string>
  avisos: Aviso[]
  chat: ChatMessage[]
  ponto: RegistroPonto[]
  medalhas: Medalha[]
}

const STORAGE_KEY = 'dce_demo_db_v1'
const LATENCY = 220

function seed(): DemoDB {
  return {
    oficiais: structuredClone(DEMO_OFICIAIS),
    detentos: structuredClone(DEMO_DETENTOS),
    historico: structuredClone(DEMO_HISTORICO),
    logs: structuredClone(DEMO_LOGS),
    codigoPenal: structuredClone(DEMO_CODIGO_PENAL),
    senhas: { ...DEMO_SENHAS },
    avisos: [],
    chat: [],
    ponto: [],
    medalhas: [],
  }
}

let db: DemoDB = load()

function load(): DemoDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DemoDB
  } catch {
    /* ignora e re-semeia */
  }
  const fresh = seed()
  persist(fresh)
  return fresh
}

function persist(next: DemoDB = db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* localStorage indisponível */
  }
}

/** Restaura o banco de demonstração para o estado inicial. */
export function resetDemoDB() {
  db = seed()
  persist()
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY))
}

function nomeOficial(id: number | null): string | null {
  if (!id) return null
  return db.oficiais.find((o) => o.id === id)?.nome ?? null
}

function registrarLog(
  oficial: { id: number; nome: string } | null,
  acao: string,
  entidade: string,
  entidadeId: number | null,
  detalhe: string,
) {
  db.logs.unshift({
    id: gerarId(),
    oficialId: oficial?.id ?? null,
    oficialNome: oficial?.nome ?? 'Sistema',
    acao,
    entidade,
    entidadeId,
    detalhe,
    criadoEm: new Date().toISOString(),
  })
  db.logs = db.logs.slice(0, 200)
}

function enriquecer(d: Detento): Detento {
  return { ...d, oficialRegistrouNome: nomeOficial(d.oficialRegistrouId) }
}

// ----------------------------- Autenticação --------------------------------

export async function demoLogin(identificador: string, senha: string) {
  const id = identificador.trim().toLowerCase()
  const oficial = db.oficiais.find(
    (o) => o.email.toLowerCase() === id || o.passaporte === identificador.trim(),
  )
  if (!oficial) throw new DemoError('Credenciais inválidas. Verifique os dados informados.', 401)
  const senhaValida = db.senhas[oficial.passaporte] === senha
  if (!senhaValida) throw new DemoError('Credenciais inválidas. Verifique os dados informados.', 401)
  if (oficial.statusConta === 'PENDENTE')
    throw new DemoError('Sua conta ainda está PENDENTE de aprovação pelo Comando.', 403)
  if (oficial.statusConta === 'BLOQUEADO')
    throw new DemoError('Sua conta está BLOQUEADA. Procure o Comando do DCE.', 403)
  return { token: `demo.${oficial.id}.${Date.now()}`, oficial }
}

export async function demoRegister(payload: {
  passaporte: string
  nome: string
  email: string
  departamento: string
  senha: string
}) {
  const passaporte = payload.passaporte.trim()
  const email = payload.email.trim().toLowerCase()
  if (db.oficiais.some((o) => o.passaporte === passaporte))
    throw new DemoError('Já existe uma solicitação com este Passaporte.', 409)
  if (db.oficiais.some((o) => o.email.toLowerCase() === email))
    throw new DemoError('Já existe uma solicitação com este E-mail.', 409)

  const novo: Oficial = {
    id: gerarId(),
    passaporte,
    nome: payload.nome.trim(),
    email,
    patente: 'Recruta',
    departamento: payload.departamento,
    nivelAcesso: 3,
    statusConta: 'PENDENTE',
    aprovadoPor: null,
    criadoEm: new Date().toISOString(),
    medalhas: [],
  }
  db.oficiais.push(novo)
  db.senhas[passaporte] = payload.senha
  persist()
  return delay({ ok: true })
}

/** Troca a senha do oficial autenticado (modo demonstração). */
export async function demoAlterarSenha(
  oficial: Oficial,
  senhaAtual: string,
  novaSenha: string,
): Promise<{ ok: boolean }> {
  const alvo = db.oficiais.find((o) => o.passaporte === oficial.passaporte)
  if (!alvo) throw new DemoError('Oficial não encontrado.', 404)
  if (db.senhas[alvo.passaporte] !== senhaAtual)
    throw new DemoError('A senha atual está incorreta.', 400)
  if (senhaAtual === novaSenha)
    throw new DemoError('A nova senha deve ser diferente da atual.', 400)
  db.senhas[alvo.passaporte] = novaSenha
  persist()
  return delay({ ok: true })
}

/** Atualiza a foto de perfil do oficial autenticado (modo demonstração). */
export async function demoAtualizarPerfil(oficial: Oficial, fotoUrl: string | null): Promise<Oficial> {
  const alvo = db.oficiais.find((o) => o.passaporte === oficial.passaporte)
  if (!alvo) throw new DemoError('Oficial não encontrado.', 404)
  alvo.fotoUrl = fotoUrl && fotoUrl.trim() ? fotoUrl.trim() : null
  persist()
  return delay({ ...alvo })
}

// --------------------------- Consulta pública ------------------------------

export async function demoFichaPublica(passaporte: string): Promise<FichaPublica> {
  const fichas = db.detentos
    .filter((d) => d.passaporteDetento === passaporte.trim())
    .sort((a, b) => +new Date(b.dataEntrada) - +new Date(a.dataEntrada))

  if (fichas.length === 0) return delay({ encontrado: false })

  const atual = fichas[0]
  const status = atual.emSolitaria ? 'EM_CUSTODIA' : atual.statusPrisao
  const statusAtual: FichaPublica['statusAtual'] =
    status === 'EM_CUSTODIA' && atual.exigeTornozeleira ? 'TORNOZELEIRA' : status

  return delay({
    encontrado: true,
    nome: atual.nomeDetento,
    passaporte: atual.passaporteDetento,
    fotoUrl: atual.fotoUrl,
    emSolitaria: atual.emSolitaria,
    nivelPericulosidade: atual.nivelPericulosidade,
    statusAtual,
    totalMeses: fichas.reduce((s, f) => s + f.tempoTotalMeses, 0),
    totalMulta: fichas.reduce((s, f) => s + f.valorMultaTotal, 0),
    passagens: fichas.map((f) => ({
      id: f.id,
      artigo: f.crimesCometidos.map((c) => c.artigo).join(', ') || '—',
      crime: f.crimesCometidos.map((c) => c.crime).join(' • ') || '—',
      tempoMeses: f.tempoTotalMeses,
      multa: f.valorMultaTotal,
      dataEntrada: f.dataEntrada,
      statusPrisao: f.statusPrisao,
    })),
  })
}

// ------------------------------- Detentos ----------------------------------

export async function demoVerificarPassaporte(passaporte: string): Promise<VerificacaoPassaporte> {
  const fichas = db.detentos
    .filter((d) => d.passaporteDetento === passaporte.trim())
    .sort((a, b) => +new Date(b.dataEntrada) - +new Date(a.dataEntrada))

  if (fichas.length === 0) return delay({ existe: false, emCustodia: false, totalPassagens: 0 })

  const atual = fichas[0]
  return delay({
    existe: true,
    emCustodia: atual.statusPrisao === 'EM_CUSTODIA',
    totalPassagens: fichas.length,
    nome: atual.nomeDetento,
    fotoUrl: atual.fotoUrl,
    ultimaFichaId: atual.id,
    statusPrisao: atual.statusPrisao,
    ultimaEntrada: atual.dataEntrada,
  })
}

export async function demoHistoricoFichas(passaporte: string): Promise<HistoricoFichas | null> {
  const fichas = db.detentos
    .filter((d) => d.passaporteDetento === passaporte.trim())
    .sort((a, b) => +new Date(a.dataEntrada) - +new Date(b.dataEntrada))

  if (fichas.length === 0) return delay(null)

  const contagem = new Map<string, { artigo: string; crime: string; ocorrencias: number }>()
  for (const f of fichas) {
    for (const c of f.crimesCometidos) {
      const atual = contagem.get(c.artigo)
      if (atual) {
        atual.ocorrencias += 1
      } else {
        contagem.set(c.artigo, { artigo: c.artigo, crime: c.crime, ocorrencias: 1 })
      }
    }
  }

  const artigos = [...contagem.values()].sort((a, b) => b.ocorrencias - a.ocorrencias)
  const lista = fichas
    .map((f, i) => ({
      id: f.id,
      numeroPrisioneiro: i + 1,
      nomeDetento: f.nomeDetento,
      passaporteDetento: f.passaporteDetento,
      dataEntrada: f.dataEntrada,
      statusPrisao: f.statusPrisao,
      tempoTotalMeses: f.tempoTotalMeses,
      valorMultaTotal: f.valorMultaTotal,
      exigeTornozeleira: f.exigeTornozeleira,
      permiteFianca: f.permiteFianca,
      policialCondutor: f.policialCondutor,
      oficialRegistrouNome: nomeOficial(f.oficialRegistrouId ?? null),
      artigos: f.crimesCometidos.map((c) => c.artigo),
      crimes: f.crimesCometidos.map((c) => c.crime),
    }))
    .sort((a, b) => +new Date(b.dataEntrada) - +new Date(a.dataEntrada))

  return delay({
    nomeDetento: fichas[0].nomeDetento,
    passaporteDetento: passaporte.trim(),
    totalFichas: fichas.length,
    totalMesesPena: fichas.reduce((acc, f) => acc + f.tempoTotalMeses, 0),
    totalMultas: fichas.reduce((acc, f) => acc + f.valorMultaTotal, 0),
    artigos,
    fichas: lista,
  })
}

export async function demoListarDetentos(busca = ''): Promise<Detento[]> {
  const termo = busca.trim().toLowerCase()
  const lista = db.detentos
    .filter(
      (d) =>
        !termo ||
        d.nomeDetento.toLowerCase().includes(termo) ||
        d.passaporteDetento.includes(termo),
    )
    .sort((a, b) => {
      const ordem = { EM_CUSTODIA: 0, FORAGIDO: 1, LIBERADO: 2 }
      return ordem[a.statusPrisao] - ordem[b.statusPrisao]
    })
    .map(enriquecer)
  return delay(lista)
}

export async function demoObterDetento(id: number): Promise<Detento | null> {
  const d = db.detentos.find((x) => x.id === id)
  return delay(d ? enriquecer(d) : null)
}

export async function demoCriarDetento(
  payload: {
    passaporteDetento: string
    nomeDetento: string
    fotoUrl: string | null
    artigoIds: number[]
    policialCondutor: string
    nivelPericulosidade: NivelPericulosidade
  },
  oficial: { id: number; nome: string },
): Promise<Detento> {
  const artigos = db.codigoPenal.filter((a) => payload.artigoIds.includes(a.id))
  const calc = calcularPena(artigos)
  const novo: Detento = {
    id: gerarId(),
    passaporteDetento: payload.passaporteDetento.trim(),
    nomeDetento: payload.nomeDetento.trim(),
    fotoUrl: payload.fotoUrl,
    crimesCometidos: calc.crimes,
    tempoTotalMeses: calc.tempoTotalMeses,
    valorMultaTotal: calc.valorMultaTotal,
    exigeTornozeleira: calc.exigeTornozeleira,
    permiteFianca: calc.permiteFianca,
    recompensa: null,
    destaqueProcurado: false,
    statusPrisao: 'EM_CUSTODIA',
    policialCondutor: payload.policialCondutor,
    oficialRegistrouId: oficial.id,
    dataEntrada: new Date().toISOString(),
    previsaoSoltura: calc.previsaoSoltura.toISOString(),
    nivelPericulosidade: payload.nivelPericulosidade,
    emSolitaria: false,
  }
  db.detentos.unshift(novo)
  registrarLog(
    oficial,
    'CRIACAO_DETENTO',
    'detentos',
    novo.id,
    `Registrou a entrada de ${novo.nomeDetento} (Passaporte ${novo.passaporteDetento}).`,
  )
  persist()
  return delay(enriquecer(novo))
}

export async function demoAtualizarDetento(
  id: number,
  payload: Partial<Pick<Detento, 'nomeDetento' | 'fotoUrl' | 'policialCondutor' | 'nivelPericulosidade' | 'statusPrisao'>>,
  oficial: { id: number; nome: string },
): Promise<Detento | null> {
  const d = db.detentos.find((x) => x.id === id)
  if (!d) return delay(null)
  Object.assign(d, payload)
  registrarLog(oficial, 'EDICAO_DETENTO', 'detentos', id, `Editou a ficha de ${d.nomeDetento}.`)
  persist()
  return delay(enriquecer(d))
}

export async function demoDarBaixa(
  id: number,
  motivo: string,
  oficial: { id: number; nome: string },
): Promise<Detento | null> {
  const d = db.detentos.find((x) => x.id === id)
  if (!d) return delay(null)
  d.statusPrisao = 'LIBERADO'
  d.emSolitaria = false
  d.motivoSolitaria = null
  d.terminoSolitaria = null
  registrarLog(oficial, 'BAIXA_DETENTO', 'detentos', id, `Concedeu liberdade a ${d.nomeDetento}. Motivo: ${motivo}`)
  persist()
  return delay(enriquecer(d))
}

export async function demoExcluirDetento(id: number, oficial: { id: number; nome: string }) {
  const d = db.detentos.find((x) => x.id === id)
  db.detentos = db.detentos.filter((x) => x.id !== id)
  db.historico = db.historico.filter((h) => h.detentoId !== id)
  if (d) registrarLog(oficial, 'EXCLUSAO_DETENTO', 'detentos', id, `Excluiu a ficha de ${d.nomeDetento}.`)
  persist()
  return delay({ ok: true })
}

// --------------------- Comportamento / Solitária ---------------------------

export async function demoRegistrarComportamento(
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
): Promise<HistoricoComportamento | null> {
  const d = db.detentos.find((x) => x.id === detentoId)
  if (!d) return delay(null)

  const registro: HistoricoComportamento = {
    id: gerarId(),
    detentoId,
    tipoRegistro: payload.tipoRegistro,
    nivelPericulosidade: payload.nivelPericulosidade,
    emSolitaria: payload.emSolitaria,
    motivoSolitaria: payload.motivoSolitaria ?? null,
    terminoSolitaria: payload.terminoSolitaria ?? null,
    descricao: payload.descricao ?? null,
    oficialResponsavelId: oficial.id,
    oficialResponsavelNome: oficial.nome,
    criadoEm: new Date().toISOString(),
  }
  db.historico.unshift(registro)

  d.nivelPericulosidade = payload.nivelPericulosidade
  if (payload.tipoRegistro === 'SOLITARIA' || payload.emSolitaria) {
    d.emSolitaria = true
    d.motivoSolitaria = payload.motivoSolitaria ?? d.motivoSolitaria ?? null
    d.terminoSolitaria = payload.terminoSolitaria ?? null
  } else {
    d.emSolitaria = false
    d.motivoSolitaria = null
    d.terminoSolitaria = null
  }

  registrarLog(
    oficial,
    'REGISTRO_COMPORTAMENTO',
    'historico_comportamento',
    registro.id,
    `Registrou ${payload.tipoRegistro} para ${d.nomeDetento}.`,
  )
  persist()
  return delay(registro)
}

export async function demoObterHistorico(detentoId: number): Promise<HistoricoComportamento[]> {
  const lista = db.historico
    .filter((h) => h.detentoId === detentoId)
    .map((h) => ({ ...h, oficialResponsavelNome: nomeOficial(h.oficialResponsavelId) }))
    .sort((a, b) => +new Date(b.criadoEm) - +new Date(a.criadoEm))
  return delay(lista)
}

// ------------------------------- Oficiais ----------------------------------

export async function demoListarOficiais(): Promise<Oficial[]> {
  return delay([...db.oficiais].sort((a, b) => a.nivelAcesso - b.nivelAcesso))
}

export async function demoListarPendentes(): Promise<Oficial[]> {
  return delay(db.oficiais.filter((o) => o.statusConta === 'PENDENTE'))
}

export async function demoAprovarOficial(
  id: number,
  dados: { patente: string; nivelAcesso: number; departamento: string },
  aprovador: { id: number; nome: string },
): Promise<Oficial | null> {
  const o = db.oficiais.find((x) => x.id === id)
  if (!o) return delay(null)
  o.statusConta = 'ATIVO'
  o.patente = dados.patente
  o.departamento = dados.departamento
  o.nivelAcesso = dados.nivelAcesso as Oficial['nivelAcesso']
  o.aprovadoPor = aprovador.id
  registrarLog(aprovador, 'APROVACAO_CADASTRO', 'oficiais', id, `Aprovou ${o.nome} como ${o.patente} (Nível ${o.nivelAcesso}).`)
  persist()
  return delay(o)
}

export async function demoRecusarOficial(id: number, aprovador: { id: number; nome: string }) {
  const o = db.oficiais.find((x) => x.id === id)
  db.oficiais = db.oficiais.filter((x) => x.id !== id)
  if (o) registrarLog(aprovador, 'RECUSA_CADASTRO', 'oficiais', id, `Recusou a solicitação de ${o.nome}.`)
  persist()
  return delay({ ok: true })
}

export async function demoAtualizarOficial(
  id: number,
  patch: Partial<Pick<Oficial, 'patente' | 'nivelAcesso' | 'statusConta'>>,
  autor: { id: number; nome: string },
): Promise<Oficial | null> {
  const o = db.oficiais.find((x) => x.id === id)
  if (!o) return delay(null)
  Object.assign(o, patch)
  registrarLog(autor, 'ALTERACAO_OFICIAL', 'oficiais', id, `Atualizou o cadastro de ${o.nome}.`)
  persist()
  return delay(o)
}

export async function demoExcluirOficial(id: number, autor: { id: number; nome: string }) {
  const o = db.oficiais.find((x) => x.id === id)
  db.oficiais = db.oficiais.filter((x) => x.id !== id)
  if (o) registrarLog(autor, 'EXCLUSAO_OFICIAL', 'oficiais', id, `Excluiu o cadastro de ${o.nome}.`)
  persist()
  return delay({ ok: true })
}

// ----------------------------- Código Penal --------------------------------

export async function demoListarCodigoPenal(): Promise<CodigoPenalArtigo[]> {
  return delay([...db.codigoPenal].sort((a, b) => a.id - b.id))
}

export async function demoCriarArtigo(
  payload: Omit<CodigoPenalArtigo, 'id'>,
  autor: { id: number; nome: string },
): Promise<CodigoPenalArtigo> {
  const novo: CodigoPenalArtigo = { ...payload, id: gerarId() }
  db.codigoPenal.push(novo)
  registrarLog(autor, 'CRIACAO_ARTIGO', 'codigo_penal', novo.id, `Criou o artigo ${novo.artigo} — ${novo.crime}.`)
  persist()
  return delay(novo)
}

export async function demoAtualizarArtigo(
  id: number,
  payload: Omit<CodigoPenalArtigo, 'id'>,
  autor: { id: number; nome: string },
): Promise<CodigoPenalArtigo | null> {
  const a = db.codigoPenal.find((x) => x.id === id)
  if (!a) return delay(null)
  Object.assign(a, payload)
  registrarLog(autor, 'EDICAO_ARTIGO', 'codigo_penal', id, `Editou o artigo ${a.artigo}.`)
  persist()
  return delay(a)
}

export async function demoExcluirArtigo(id: number, autor: { id: number; nome: string }) {
  const a = db.codigoPenal.find((x) => x.id === id)
  db.codigoPenal = db.codigoPenal.filter((x) => x.id !== id)
  if (a) registrarLog(autor, 'EXCLUSAO_ARTIGO', 'codigo_penal', id, `Excluiu o artigo ${a.artigo}.`)
  persist()
  return delay({ ok: true })
}

// ----------------------- Auditoria & Estatísticas --------------------------

export async function demoListarAuditoria(): Promise<LogAuditoria[]> {
  return delay(db.logs.map((l) => ({ ...l, oficialNome: l.oficialNome ?? nomeOficial(l.oficialId) })))
}

export async function demoEstatisticas(): Promise<Estatisticas> {
  const estatisticas: Estatisticas = {
    totalDetentos: db.detentos.length,
    emCustodia: db.detentos.filter((d) => d.statusPrisao === 'EM_CUSTODIA').length,
    liberados: db.detentos.filter((d) => d.statusPrisao === 'LIBERADO').length,
    foragidos: db.detentos.filter((d) => d.statusPrisao === 'FORAGIDO').length,
    emSolitaria: db.detentos.filter((d) => d.emSolitaria).length,
    exigeTornozeleira: db.detentos.filter((d) => d.exigeTornozeleira).length,
    oficiaisAtivos: db.oficiais.filter((o) => o.statusConta === 'ATIVO').length,
    oficiaisPendentes: db.oficiais.filter((o) => o.statusConta === 'PENDENTE').length,
    totalArtigos: db.codigoPenal.length,
    totalOcorrencias: db.historico.length,
  }
  return delay(estatisticas)
}

// --- Mural de Avisos ---
export function demoAvisos(): Promise<Aviso[]> {
  return delay(db.avisos)
}

export function demoPostAviso(payload: {
  titulo: string
  mensagem: string
  imagemUrl?: string
  nivelUrgencia: string
}): Promise<Aviso> {
  const novo: Aviso = {
    id: gerarId(),
    autorId: 1,
    autorNome: 'Comando Demo',
    autorPatente: 'Diretor Geral',
    titulo: payload.titulo,
    mensagem: payload.mensagem,
    imagemUrl: payload.imagemUrl ?? null,
    nivelUrgencia: payload.nivelUrgencia as any,
    dataCriacao: new Date().toISOString(),
  }
  db.avisos.unshift(novo)
  persist()
  return delay(novo)
}

// --- Chat ---
export function demoChat(): Promise<ChatMessage[]> {
  const hoje = new Date().toISOString().split('T')[0]
  const mensagens = db.chat.filter((m) => m.dataEnvio.startsWith(hoje))
  return delay(mensagens)
}

export function demoPostChatMessage(mensagem: string): Promise<ChatMessage> {
  const novo: ChatMessage = {
    id: gerarId(),
    oficialId: 1,
    nomeOficial: 'Oficial Demo',
    patente: 'Agente',
    mensagem,
    dataEnvio: new Date().toISOString(),
  }
  db.chat.push(novo)
  persist()
  return delay(novo)
}

// --- Bate-Ponto ---
export function demoIniciarPonto(): Promise<RegistroPonto> {
  const novo: RegistroPonto = {
    id: gerarId(),
    oficialId: 1,
    nomeOficial: 'Oficial Demo',
    patente: 'Agente',
    entrada: new Date().toISOString(),
    saida: null,
    duracaoMinutos: null,
  }
  db.ponto.push(novo)
  persist()
  return delay(novo)
}

export function demoEncerrarPonto(): Promise<RegistroPonto> {
  const ponto = db.ponto.find((p) => p.oficialId === 1 && !p.saida)
  if (!ponto) throw new Error('Nenhum ponto aberto')
  ponto.saida = new Date().toISOString()
  ponto.duracaoMinutos = Math.floor(
    (new Date(ponto.saida).getTime() - new Date(ponto.entrada).getTime()) / 60000,
  )
  persist()
  return delay(ponto)
}

export function demoPontoAtivos(): Promise<RegistroPonto[]> {
  return delay(db.ponto.filter((p) => !p.saida))
}

export function demoPontoRanking(): Promise<RankingPonto[]> {
  const ranking: RankingPonto[] = [
    { oficialId: 1, nomeOficial: 'Oficial Demo', patente: 'Agente', totalMinutos: 1200, totalTurnos: 5 },
  ]
  return delay(ranking)
}

// --- Medalhas ---
export function demoConcederMedalha(
  oficialId: number,
  payload: { nomeMedalha: string; descricao: string; icone?: string },
): Promise<Medalha> {
  const nova: Medalha = {
    id: gerarId(),
    nomeMedalha: payload.nomeMedalha,
    descricao: payload.descricao,
    icone: payload.icone ?? null,
    dataConcessao: new Date().toISOString(),
    concedidoPorNome: 'Comando Demo',
    concedidoPorPatente: 'Diretor Geral',
  }
  const oficial = db.oficiais.find((o) => o.id === oficialId)
  if (oficial) {
    if (!oficial.medalhas) oficial.medalhas = []
    oficial.medalhas.push(nova)
  }
  persist()
  return delay(nova)
}

// --- Foragidos ---
export function demoForagidos(): Promise<Foragido[]> {
  const foragidos = db.detentos
    .filter((d) => d.statusPrisao === 'FORAGIDO')
    .slice(0, 5)
    .map((d) => ({
      id: d.id,
      passaporte: d.passaporteDetento,
      nome: d.nomeDetento,
      fotoUrl: d.fotoUrl,
      crimes: d.crimesCometidos.map((c) => c.crime),
      recompensa: (d as any).recompensa ?? 5000,
    }))
  return delay(foragidos)
}

export class DemoError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}
