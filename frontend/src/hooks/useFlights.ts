import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { Flight } from '@/types/schema'
import type { FlightSearchParams, FlightSearchResponse, FlightBookRequest, FlightBookResponse } from '@/api/api'

interface FlightsListResponse {
  page: number
  limit: number
  total: number
  items: Flight[]
}

export function useFlightSearch(params: Partial<FlightSearchParams> & { enabled?: boolean }) {
  const { enabled = true, ...searchParams } = params
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
  ).toString()

  return useQuery<FlightSearchResponse>({
    queryKey: ['flights', 'search', searchParams],
    queryFn: async () => {
      const response = await apiClient.get<FlightSearchResponse>(`/flights/search?${qs}`)
      return response
    },
    enabled: enabled && !!(searchParams.origin && searchParams.destination),
    staleTime: 5 * 60 * 1000,
  })
}

export function useFlight(id: string) {
  return useQuery<Flight>({
    queryKey: ['flight', id],
    queryFn: async () => {
      const response = await apiClient.get<Flight>(`/flights/${id}`)
      return (response as any).data || response
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes instead of default 5
    refetchOnWindowFocus: false, // Don't refetch on window focus for flight details
  })
}

export function useFlightsList(params: { page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams({ page: String(params.page ?? 1), limit: String(params.limit ?? 20) }).toString()
  return useQuery<FlightsListResponse>({
    queryKey: ['flights', 'list', params],
    queryFn: () => apiClient.get<FlightsListResponse>(`/flights?${qs}`),
    staleTime: 5 * 60 * 1000,
  })
}

export function useBookFlight() {
  const qc = useQueryClient()
  return useMutation<FlightBookResponse, Error, FlightBookRequest>({
    mutationFn: async (data) => {
      try {
        const response = await apiClient.post<FlightBookResponse>('/flights/book', data)
        return (response as any).data || response
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.message.includes('401') || err.message.includes('Unauthorized')) {
            throw new Error('Veuillez vous connecter pour réserver un vol')
          }
          if (err.message.includes('403') || err.message.includes('Forbidden')) {
            throw new Error('Vous n\'avez pas les permissions pour réserver ce vol')
          }
          if (err.message.includes('404') || err.message.includes('Not found')) {
            throw new Error('Vol non trouvé')
          }
        }
        throw err
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }) },
  })
}
