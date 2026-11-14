import { create } from 'zustand'

interface ConnectionState {
  /** null = ainda não verificado; true = API offline (modo demo); false = API online */
  demoMode: boolean | null
  setDemoMode: (v: boolean | null) => void
  /** Motivo opcional (ex.: erro de rede) exibido no banner. */
  motivo: string | null
  setMotivo: (m: string | null) => void
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  demoMode: null,
  setDemoMode: (demoMode) => set({ demoMode }),
  motivo: null,
  setMotivo: (motivo) => set({ motivo }),
}))
