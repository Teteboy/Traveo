import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { Booking } from '@/api/api'

interface BookingsResponse {
  page: number
  limit: number
  total: number
  items: Booking[]
}

interface BookingParams {
  page?: number
  limit?: number
  status?: string
  type?: string
}

export function useBookings(params: BookingParams & { enabled?: boolean } = {}) {
  const { enabled = true, ...queryParams } = params
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries({ page: 1, limit: 20, ...queryParams }).filter(([, v]) => v).map(([k, v]) => [k, String(v)]))
  ).toString()

  return useQuery<BookingsResponse>({
    queryKey: ['bookings', queryParams],
    queryFn: async () => {
      try {
        return await apiClient.get<BookingsResponse>(`/bookings?${qs}`)
      } catch (error: any) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          throw new Error('Veuillez vous connecter pour consulter vos réservations')
        }
        throw error
      }
    },
    staleTime: 2 * 60 * 1000,
    enabled,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message?.includes('connecter')) return false
      return failureCount < 2
    },
  })
}

export function useBooking(id: string) {
  return useQuery<{ data: Booking & { flight?: unknown; service?: unknown } }>({
    queryKey: ['booking', id],
    queryFn: () => apiClient.get(`/bookings/${id}`),
    enabled: !!id,
  })
}

type TicketResponse = { data: { qrPayload: string; issuedAt: string } | null }

export function useBookingTicket(id: string, enabled = false) {
  return useQuery<TicketResponse>({
    queryKey: ['booking', id, 'ticket'],
    queryFn: async () => {
      try {
        return await apiClient.get<TicketResponse>(`/bookings/${id}/ticket`)
      } catch (err: any) {
        // If backend responds that ticket is unavailable (400), return null result
        if (err && (err.status === 400 || err.status === 404)) {
          return { data: null }
        }
        throw err
      }
    },
    enabled: !!id && enabled,
    retry: (failureCount, error: any) => {
      // Don't retry on 400/404 errors (ticket unavailable)
      if (error && (error.status === 400 || error.status === 404)) {
        return false
      }
      return failureCount < 1
    },
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, string>({
    mutationFn: (id) => apiClient.delete(`/bookings/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }) },
  })
}

export function useUpdateBooking() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { id: string; status: string }>({
    mutationFn: ({ id, ...data }) => apiClient.patch(`/bookings/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }) },
  })
}


