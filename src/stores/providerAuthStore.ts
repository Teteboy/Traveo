import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProviderProfile, ServiceType } from '@/types/provider'
import { apiClient, setTokens, clearTokens } from '@/lib/apiClient'

interface ProviderAuthState {
  provider: ProviderProfile | null
  isProviderAuthenticated: boolean
  currentServiceType: ServiceType
  providerLogin: (email: string, password: string) => Promise<boolean>
  providerLogout: () => void
  switchServiceType: (serviceType: ServiceType) => void
  updateProviderProfile: (profile: Partial<ProviderProfile>) => void
}

interface LoginResponse {
  data: {
    user: { id: string; email: string; firstName: string; lastName: string; role: string; phone?: string; avatar?: string }
    tokens: { accessToken: string; refreshToken: string }
    provider?: { id: string; companyName: string; businessType: string; isVerified: boolean; verificationProgress: number }
  }
}

export const useProviderAuthStore = create<ProviderAuthState>()(
  persist(
    (set) => ({
      provider: null,
      isProviderAuthenticated: false,
      currentServiceType: 'hotel',

       providerLogin: async (email: string, password: string) => {
         try {
           const res = await apiClient.post<LoginResponse>('/auth/login', { email, password })
           if (res.data.user.role !== 'PROVIDER') {
             return false
           }
           setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken)

           // Fetch provider profile
           let providerData: { id: string; companyName: string; businessType: string; isVerified: boolean; verificationProgress: number } | undefined
            try {
              const provRes = await apiClient.get<{ data: { id: string; companyName: string; businessType: string; isVerified: boolean; verificationProgress: number } }>('/providers/me')
              providerData = provRes.data.data
            } catch { /* provider profile may not exist yet */ }

           const profile: ProviderProfile = {
             id: res.data.user.id,
             name: `${res.data.user.firstName} ${res.data.user.lastName}`,
             email: res.data.user.email,
             phone: res.data.user.phone ?? '',
             avatar: res.data.user.avatar ?? '',
             role: 'Provider',
             businessName: providerData?.companyName ?? 'My Business',
             businessType: (providerData?.businessType?.toLowerCase() ?? 'hotel') as ServiceType,
             verificationProgress: providerData?.verificationProgress ?? 0,
             isVerified: providerData?.isVerified ?? false,
           }

            set({
              provider: profile,
              isProviderAuthenticated: true,
              currentServiceType: (providerData?.businessType?.toLowerCase() || profile.businessType) as ServiceType,
            })
           return true
         } catch {
           return false
         }
       },

      providerLogout: () => {
        clearTokens()
        set({ provider: null, isProviderAuthenticated: false, currentServiceType: 'hotel' })
      },

      switchServiceType: (serviceType: ServiceType) => set({ currentServiceType: serviceType }),

      updateProviderProfile: (profileUpdate: Partial<ProviderProfile>) =>
        set((state) => ({
          provider: state.provider ? { ...state.provider, ...profileUpdate } : null,
        })),
    }),
    { name: 'provider-auth-storage' }
  )
)
