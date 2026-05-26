import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { getAccessToken } from '@/lib/apiClient'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

/** Route guard that redirects unauthenticated users to login.
 *  Treats either an authenticated store flag OR a present access token as authorized
 *  (the bootstrap hook will revalidate the token and clear stale state). */
export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  const hasToken = Boolean(getAccessToken())

  if (!isAuthenticated && !hasToken) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }
  return <>{children}</>
}
