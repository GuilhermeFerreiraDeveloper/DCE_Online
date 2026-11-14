import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

interface ProtectedRouteProps {
  niveis?: number[]
}

export function ProtectedRoute({ niveis }: ProtectedRouteProps) {
  const { oficial } = useAuthStore()
  const location = useLocation()

  if (!oficial) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (niveis && !niveis.includes(oficial.nivelAcesso)) {
    return <Navigate to="/painel" replace />
  }

  return <Outlet />
}
