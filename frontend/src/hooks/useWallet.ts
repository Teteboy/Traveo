import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { WalletBalanceResponse, WalletTransactionsResponse } from '@/api/api'

export function useWalletBalance(enabled = true) {
  return useQuery<WalletBalanceResponse>({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      try {
        return await apiClient.get<WalletBalanceResponse>('/wallet/balance')
      } catch (error: any) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          throw new Error('Veuillez vous connecter pour accéder à votre portefeuille')
        }
        throw error
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message?.includes('connecter')) return false
      return failureCount < 2
    },
  })
}

export function useWalletTransactions(params: { page?: number; limit?: number; enabled?: boolean } = {}) {
  const { enabled = true, ...queryParams } = params
  const qs = new URLSearchParams({ page: String(queryParams.page ?? 1), limit: String(queryParams.limit ?? 20) }).toString()
  return useQuery<WalletTransactionsResponse>({
    queryKey: ['wallet', 'transactions', queryParams],
    queryFn: async () => {
      try {
        return await apiClient.get<WalletTransactionsResponse>(`/wallet/transactions?${qs}`)
      } catch (error: any) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          throw new Error('Veuillez vous connecter pour consulter vos transactions')
        }
        throw error
      }
    },
    staleTime: 30 * 1000,
    enabled,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message?.includes('connecter')) return false
      return failureCount < 2
    },
  })
}

export function useAddFunds() {
  const qc = useQueryClient()
  return useMutation<WalletBalanceResponse, Error, { amount: number; currency?: string; provider?: string; phone?: string }>({
    mutationFn: async (data) => {
      try {
        return await apiClient.post<WalletBalanceResponse>('/wallet/add-funds', data)
      } catch (error: any) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          throw new Error('Veuillez vous connecter pour recharger votre portefeuille')
        }
        throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

export function usePayWithWallet() {
  const qc = useQueryClient()
  return useMutation<{
    data: {
      bookingId: string
      paymentId: string
      status: string
      balances: Array<{ currency: string; amount: number }>
    }
  }, Error, { bookingId: string }>({
    mutationFn: async ({ bookingId }) => {
      try {
        return await apiClient.post(`/wallet/pay`, { bookingId })
      } catch (error: any) {
        if (error.code === 'INSUFFICIENT_BALANCE') {
          throw new Error('Solde insuffisant. Veuillez recharger votre portefeuille.')
        }
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          throw new Error('Veuillez vous connecter pour effectuer un paiement')
        }
        throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] })
      qc.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useWithdraw() {
  const qc = useQueryClient()
  return useMutation<WalletBalanceResponse, Error, { amount: number; currency?: string; provider?: string; phone?: string }>({
    mutationFn: async (data) => {
      try {
        return await apiClient.post<WalletBalanceResponse>('/wallet/withdraw', data)
      } catch (error: any) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          throw new Error('Veuillez vous connecter pour effectuer un retrait')
        }
        throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

// Refund hooks
export function useRefundRequests(params: { page?: number; limit?: number; status?: string; enabled?: boolean } = {}) {
  const { enabled = true, ...queryParams } = params
  const qs = new URLSearchParams({ page: String(queryParams.page ?? 1), limit: String(queryParams.limit ?? 20) }).toString()

  return useQuery<{
    items: Array<{
      id: string
      bookingId: string
      bookingType: string
      amount: number
      currency: string
      reason: string
      status: string
      requestDate: string
      estimatedDate?: string
      completedDate?: string
    }>
    total: number
    page: number
    limit: number
  }>({
    queryKey: ['refunds', queryParams],
    queryFn: async () => {
      try {
        return await apiClient.get(`/bookings/refunds/list?${qs}`)
      } catch (error: any) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          throw new Error('Veuillez vous connecter pour consulter vos remboursements')
        }
        throw error
      }
    },
    staleTime: 30 * 1000,
    enabled,
    retry: (failureCount, error) => {
      if (error.message?.includes('connecter')) return false
      return failureCount < 2
    },
  })
}

export function useCreateRefund() {
  const qc = useQueryClient()
  return useMutation<{
    id: string
    bookingId: string
    amount: number
    currency: string
    reason: string
    status: string
    requestDate: string
    estimatedDate?: string
  }, Error, { bookingId: string; amount: number; reason: string }>({
    mutationFn: async (data) => {
      try {
        return await apiClient.post(`/bookings/${data.bookingId}/refunds`, {
          amount: data.amount,
          reason: data.reason,
        })
      } catch (error: any) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          throw new Error('Veuillez vous connecter pour soumettre une demande de remboursement')
        }
        throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['refunds'] })
      qc.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}
