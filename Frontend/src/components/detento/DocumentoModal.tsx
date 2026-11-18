import { ShieldHalf, CheckCircle, Download } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import type { Detento, Oficial } from '@/types'
import { formatDateTime, gerarId } from '@/utils/format'

interface Props {
  detento: Detento
  oficial: Oficial | null
  aberto: boolean
  onFechar: () => void
}

export function DocumentoModal({ detento, oficial, aberto, onFechar }: Props) {
  const protocolo = `DCE-${gerarId()}-${new Date().getFullYear()}`
  const ehSoltura = detento.statusPrisao === 'LIBERADO'

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Documento Oficial do Estado">
      <div className="space-y-6">
        <div id="documento-oficial" className="bg-white p-8 text-slate-900 shadow-2xl">
          {/* CABEÇALHO DO DOCUMENTO */}
          <div className="flex items-center justify-between border-b-2 border-navy-900 pb-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="group transition-transform hover:scale-105">
                <img 
                  src="/DCELOGO.png" 
                  alt="DCE Logo" 
                  className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </Link>
              <div>
                <h1 className="font-display text-xl font-bold uppercase tracking-tight text-navy-950">
                  Departamento de Custódia
                </h1>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-navy-800">
                  Estado de San Andreas · GTA RP
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[0.6rem] font-bold uppercase text-slate-500">Protocolo de Registro</p>
              <p className="font-mono text-sm font-bold text-navy-900">{protocolo}</p>
            </div>
          </div>

          {/* TÍTULO DO DOCUMENTO */}
          <div className="mt-8 text-center">
            <h2 className="font-display text-2xl font-black uppercase underline decoration-gold-500 decoration-4 underline-offset-8 text-navy-950">
              {ehSoltura ? 'Alvará de Soltura Judicial' : 'Mandado de Custódia Operacional'}
            </h2>
          </div>

          {/* CORPO DO DOCUMENTO */}
          <div className="mt-10 space-y-4 text-sm leading-relaxed">
            <p>
              O <strong>DEPARTAMENTO DE CUSTÓDIA DO ESTADO (DCE)</strong>, no uso de suas atribuições legais, 
              {ehSoltura ? ' DECLARA a liberdade imediata do cidadão abaixo identificado:' : ' DETERMINA a custódia obrigatória do cidadão abaixo identificado:'}
            </p>

            <div className="rounded border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[0.6rem] font-bold uppercase text-slate-500">Nome do Cidadão</p>
                  <p className="font-bold text-navy-950 uppercase">{detento.nomeDetento}</p>
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold uppercase text-slate-500">Passaporte/ID</p>
                  <p className="font-bold text-navy-950">{detento.passaporteDetento}</p>
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold uppercase text-slate-500">Status no Sistema</p>
                  <p className={`font-bold uppercase ${ehSoltura ? 'text-green-600' : 'text-red-600'}`}>
                    {detento.statusPrisao.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold uppercase text-slate-500">Data de Emissão</p>
                  <p className="font-bold text-navy-950">{formatDateTime(new Date().toISOString())}</p>
                </div>
              </div>
            </div>

            <p>
              Fica ciente o referido cidadão das obrigações legais impostas pela justiça do Estado, sob pena de reincidência 
              e agravamento de pena conforme o Código Penal vigente.
            </p>
          </div>

          {/* ASSINATURA E CARIMBO */}
          <div className="mt-12 flex items-end justify-between">
            <div className="text-center">
              <div className="mb-1 w-48 border-b border-slate-400"></div>
              <p className="text-[0.6rem] font-bold uppercase text-navy-900">{oficial?.nome}</p>
              <p className="text-[0.5rem] uppercase text-slate-500">{oficial?.patente} · Responsável</p>
            </div>

            <div className="relative rotate-[-15deg]">
              <div className="flex flex-col items-center justify-center rounded-full border-4 border-gold-600/30 p-2 text-gold-600">
                <CheckCircle size={32} />
                <span className="text-[0.6rem] font-black uppercase">Validado</span>
                <span className="text-[0.5rem] font-bold">DCE-SEC</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-2 text-center text-[0.5rem] text-slate-400">
            Documento gerado eletronicamente. A autenticidade pode ser confirmada no portal oficial do DCE.
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onFechar} className="dce-btn-ghost">Fechar</button>
          <button 
            onClick={() => window.print()}
            className="dce-btn-primary"
          >
            <Download size={18} /> Baixar / Imprimir PDF
          </button>
        </div>
      </div>
    </Modal>
  )
}
