import { useCallback, useEffect, useMemo, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { EmptyState, InlineError, Spinner } from '@/components/ui/Feedback'
import { dceApi } from '@/services/api'
import type { LogAuditoria } from '@/types'
import { formatDateTime } from '@/utils/format'

const ACAO_CLS: Record<string, string> = {
  CRIACAO: 'text-emerald-300',
  APROVACAO: 'text-emerald-300',
  EDICAO: 'text-sky-300',
  ALTERACAO: 'text-sky-300',
  BAIXA: 'text-emerald-300',
  EXCLUSAO: 'text-red-300',
  RECUSA: 'text-red-300',
  BLOQUEIO: 'text-amber-300',
  REGISTRO: 'text-fuchsia-300',
}

function corAcao(acao: string) {
  const chave = Object.keys(ACAO_CLS).find((k) => acao.includes(k))
  return chave ? ACAO_CLS[chave] : 'text-slate-300'
}

export default function Auditoria() {
  const [logs, setLogs] = useState<LogAuditoria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      setLogs(await dceApi.listarAuditoria())
    } catch {
      setErro('Não foi possível carregar os logs de auditoria.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return logs.filter(
      (l) =>
        !termo ||
        l.acao.toLowerCase().includes(termo) ||
        l.entidade.toLowerCase().includes(termo) ||
        (l.oficialNome ?? '').toLowerCase().includes(termo) ||
        (l.detalhe ?? '').toLowerCase().includes(termo),
    )
  }, [logs, busca])

  return (
    <div className="space-y-6">
      <header>
        <p className="dce-section-title">
          <ScrollText size={14} /> Comando / Staff
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-white">Logs de Auditoria</h1>
        <p className="mt-1 text-sm text-slate-400">
          Registro cronológico de ações sensíveis realizadas no sistema. {logs.length} eventos.
        </p>
      </header>

      <div className="dce-panel p-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="dce-input"
          placeholder="Filtrar por ação, entidade, oficial ou detalhe..."
        />
      </div>

      {erro && <InlineError>{erro}</InlineError>}

      {carregando ? (
        <Spinner label="Carregando auditoria..." />
      ) : filtrados.length === 0 ? (
        <EmptyState titulo="Nenhum evento registrado" descricao="As ações sensíveis aparecerão aqui." />
      ) : (
        <div className="dce-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="dce-table min-w-[720px]">
              <thead>
                <tr>
                  <th>Data / Hora</th>
                  <th>Oficial</th>
                  <th>Ação</th>
                  <th>Entidade</th>
                  <th>Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((l) => (
                  <tr key={l.id}>
                    <td className="whitespace-nowrap text-slate-400">{formatDateTime(l.criadoEm)}</td>
                    <td className="text-slate-200">{l.oficialNome ?? 'Sistema'}</td>
                    <td className={`font-mono text-xs font-semibold ${corAcao(l.acao)}`}>{l.acao}</td>
                    <td className="font-mono text-xs text-slate-400">
                      {l.entidade}
                      {l.entidadeId ? `#${l.entidadeId}` : ''}
                    </td>
                    <td className="text-slate-300">{l.detalhe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
