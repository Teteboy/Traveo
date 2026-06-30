import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { Destination } from '@/types/schema'

interface DestinationsResponse {
  page: number
  limit: number
  total: number
  items: Destination[]
}

interface QueryParams {
  page?: number
  limit?: number
  search?: string
  country?: string
}

export function useDestinations(params: QueryParams = {}) {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 20),
    ...(params.search && { search: params.search }),
    ...(params.country && { country: params.country }),
  }).toString()

  return useQuery<DestinationsResponse>({
    queryKey: ['destinations', params],
    queryFn: async () => {
      const response = await apiClient.get<DestinationsResponse>(`/destinations?${qs}`)
      return response
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useDestination(id: string) {
  return useQuery<Destination>({
    queryKey: ['destination', id],
    queryFn: async () => {
      const response = await apiClient.get<Destination>(`/destinations/${id}`)
      return (response as any).data || response
    },
    enabled: !!id,
  })
}
