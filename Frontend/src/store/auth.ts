import { create } from 'zustand'
import type { Oficial } from '@/types'
import { dceApi, setAuthToken } from '@/services/api'
import { useConnectionStore } from './connection'

const TOKEN_KEY = 'dce_token'
const USER_KEY = 'dce_user'

interface AuthState {
  oficial: Oficial | null
  token: string | null
  carregando: boolean
  login: (identificador: string, senha: string) => Promise<void>
  logout: () => void
  restaurar: () => void
  podeNivel: (...niveis: number[]) => boolean
}

function lerUsuario(): Oficial | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as Oficial) : null
  } catch {
    return null
  }
}

const tokenInicial = localStorage.getItem(TOKEN_KEY)
if (tokenInicial) setAuthToken(tokenInicial)

export const useAuthStore = create<AuthState>((set, get) => ({
  oficial: lerUsuario(),
  token: tokenInicial,
  carregando: false,

  restaurar: () => {
    const t = localStorage.getItem(TOKEN_KEY)
    if (t) setAuthToken(t)
    set({ token: t, oficial: lerUsuario() })
  },

  login: async (identificador, senha) => {
    set({ carregando: true })
    try {
      const { token, oficial } = await dceApi.login(identificador, senha)
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(oficial))
      setAuthToken(token)
      set({ token, oficial })
    } finally {
      set({ carregando: false })
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setAuthToken(null)
    useConnectionStore.getState().setDemoMode(null)
    set({ token: null, oficial: null })
  },

  podeNivel: (...niveis) => {
    const n = get().oficial?.nivelAcesso
    return n != null && niveis.includes(n)
  },
}))
