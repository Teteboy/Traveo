import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { getAccessToken, clearTokens } from '@/lib/apiClient'
import { toast } from 'sonner'

/** Re-validate the persisted token on mount and listen for global unauthorized events.
 *  Does NOT navigate — public pages must remain accessible without a session. */
export function useBootstrapAuth() {
  useEffect(() => {
    const { fetchMe, isAuthenticated, user } = useAuthStore.getState()
    if (getAccessToken()) {
      fetchMe()
    } else if (isAuthenticated || user) {
      // No token but stale persisted auth — clear it
      useAuthStore.setState({ user: null, isAuthenticated: false })
    }
    const handler = () => {
      clearTokens()
      useAuthStore.setState({ user: null, isAuthenticated: false })
    }
    window.addEventListener('traveo:unauthorized', handler)
    return () => window.removeEventListener('traveo:unauthorized', handler)
  }, [])
}

/** Redirect to login if not authenticated. Page-level guard. */
export function useRequireAuth(redirectTo = '/login') {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  useEffect(() => {
    if (!isAuthenticated && !getAccessToken()) {
      toast.error('Veuillez vous connecter pour accéder à cette page')
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, redirectTo, navigate])
  return isAuthenticated
}

export function useCurrentUser() {
  return useAuthStore((s) => s.user)
}
