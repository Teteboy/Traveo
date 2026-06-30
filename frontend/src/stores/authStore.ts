import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient, setTokens, clearTokens } from '@/lib/apiClient'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  country: string
  role: 'user' | 'provider' | 'admin' | 'super_admin'
  title?: string
  dateOfBirth?: string
  gender?: string
  createdAt: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  updateUser: (data: Partial<AuthUser>) => void
  updateProfile: (data: Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'phone' | 'avatar' | 'country' | 'title' | 'dateOfBirth' | 'gender'>>) => Promise<void>
  clearError: () => void
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  country?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      logout: async () => {
        try {
          await apiClient.post('/auth/logout', { refreshToken: localStorage.getItem('traveo_refresh_token') })
        } catch { /* ignore */ }
        clearTokens()
        set({ user: null, isAuthenticated: false })
      },

      fetchMe: async () => {
        try {
          const res = await apiClient.get<{ data: { user: AuthUser } }>('/auth/me')
          set({ user: res.data.user, isAuthenticated: true })
        } catch {
          clearTokens()
          set({ user: null, isAuthenticated: false })
        }
      },

       login: async (email, password) => {
         set({ isLoading: true, error: null })
         try {
           const res = await apiClient.post<{ data: { user: AuthUser; tokens: { accessToken: string; refreshToken: string } } }>('/auth/login', { email, password })
           setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken)
           // Convert role to lowercase to match AuthUser interface (which expects lowercase)
           const roleLower = res.data.user.role.toLowerCase() as 'user' | 'provider' | 'admin' | 'super_admin'
           const userWithLowercaseRole = { ...res.data.user, role: roleLower }
           set({ user: userWithLowercaseRole, isAuthenticated: true, isLoading: false })
         } catch (err: unknown) {
           const msg = err instanceof Error ? err.message : 'Connexion échouée'
           set({ isLoading: false, error: msg })
           throw err
         }
       },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const res = await apiClient.post<{ data: { user: AuthUser; tokens: { accessToken: string; refreshToken: string } } }>('/auth/register', data)
          setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken)
          set({ user: res.data.user, isAuthenticated: true, isLoading: false })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Inscription échouée'
          set({ isLoading: false, error: msg })
          throw err
        }
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updateProfile: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const res = await apiClient.patch<{ data: { user: AuthUser } }>('/auth/me', data)
          set({ user: res.data.user, isLoading: false })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Mise à jour échouée'
          set({ isLoading: false, error: msg })
          throw err
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'traveo-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
