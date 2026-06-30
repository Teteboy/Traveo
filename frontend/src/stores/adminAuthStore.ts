import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient, setTokens, clearTokens } from '@/lib/apiClient'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'moderator'
  avatar?: string
}

interface AdminAuthState {
  admin: AdminUser | null
  isAdminAuthenticated: boolean
  adminLogin: (email: string, password: string) => Promise<boolean>
  adminLogout: () => void
}

interface LoginResponse {
  data: {
    user: { id: string; email: string; firstName: string; lastName: string; role: string; avatar?: string }
    tokens: { accessToken: string; refreshToken: string }
  }
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      isAdminAuthenticated: false,

       adminLogin: async (email: string, password: string) => {
         try {
           const res = await apiClient.post<LoginResponse>('/auth/login', { email, password })
           // Accept ADMIN or SUPER_ADMIN roles from backend (backend now sends uppercase)
           const userRole = res.data.user.role
           if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
             return false
           }
           setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken)
           set({
             admin: {
               id: res.data.user.id,
               email: res.data.user.email,
               name: `${res.data.user.firstName} ${res.data.user.lastName}`,
               role: userRole.toLowerCase() as 'super_admin' | 'admin',
               avatar: res.data.user.avatar,
             },
             isAdminAuthenticated: true,
           })
           return true
         } catch {
           return false
         }
       },

      adminLogout: () => {
        clearTokens()
        set({ admin: null, isAdminAuthenticated: false })
      },
    }),
    { name: 'admin-auth-storage' }
  )
)
