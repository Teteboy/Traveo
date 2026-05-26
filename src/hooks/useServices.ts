/**
 * Generic TanStack Query hooks for Hotels, Guides, Restaurants, Transfers, Events
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { Hotel, Guide, Restaurant, Event } from '@/types/schema'

type ServiceType = 'hotels' | 'guides' | 'restaurants' | 'transfers' | 'events'

interface ListResponse<T> {
  page: number
  limit: number
  total: number
  items: T[]
}

interface ServiceQueryParams {
  page?: number
  limit?: number
  search?: string
  country?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  location?: string
  checkInDate?: string
  checkOutDate?: string
  guests?: number
  enabled?: boolean
}

function makeServiceHooks<T>(type: ServiceType) {
  function useList(params: ServiceQueryParams = {}) {
    const { enabled = true, ...queryParams } = params
    const limit = queryParams.limit || 20
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries({ page: 1, limit, ...queryParams })
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    ).toString()
    return useQuery<ListResponse<T>>({
      queryKey: [type, 'list', queryParams],
      queryFn: async () => {
        try {
          const response = await apiClient.get<ListResponse<T>>(`/${type}?${qs}`)
          return response || { page: 1, limit, total: 0, items: [] }
        } catch {
          return { page: 1, limit, total: 0, items: [] }
        }
      },
      staleTime: 5 * 60 * 1000,
      enabled,
    })
  }

  function useItem(id: string) {
    return useQuery<T>({
      queryKey: [type, id],
      queryFn: async () => {
        try {
          const response = await apiClient.get<T>(`/${type}/${id}`)
          return (response as any).data || response
        } catch {
          return null as T
        }
      },
      enabled: !!id,
    })
  }

  function useBook() {
    const qc = useQueryClient()
    return useMutation<{ bookingId: string; status: string }, Error, Record<string, unknown> & { id: string }>({
      mutationFn: async ({ id, ...data }) => {
        try {
          const response = await apiClient.post<{ data: { bookingId: string; status: string } }>(`/${type}/${id}/book`, data)
          return (response as any).data || response
        } catch (err: unknown) {
          if (err instanceof Error) {
            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
              throw new Error('Veuillez vous connecter pour effectuer une réservation')
            }
            if (err.message.includes('403') || err.message.includes('Forbidden')) {
              throw new Error('Vous n\'avez pas les permissions pour cette action')
            }
            if (err.message.includes('404') || err.message.includes('Not found')) {
              throw new Error('Service non trouvé')
            }
          }
          throw err
        }
      },
      onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }) },
    })
  }

  return { useList, useItem, useBook }
}

export const { useList: useHotels, useItem: useHotel, useBook: useBookHotel } = makeServiceHooks<Hotel>('hotels')

// Duffel Stays search — separate from local hotels list
export interface DuffelHotelResult {
  offerId: string
  accommodationId?: string
  name: string
  description?: string
  imageUrl?: string | null
  rating?: number | null
  location?: string
  country?: string
  price: number
  currency: string
  amenities?: string[]
}

export function useDuffelHotels(params: {
  location?: string
  checkInDate?: string
  checkOutDate?: string
  guests?: number
  rooms?: number
  enabled?: boolean
}) {
  const { enabled = true, ...q } = params
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(q)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)])
    )
  ).toString()
  return useQuery<{ source: string; total: number; results: DuffelHotelResult[] }>({
    queryKey: ['hotels', 'duffel', q],
    queryFn: () => apiClient.get(`/hotels/search/duffel?${qs}`),
    enabled: enabled && Boolean(q.location && q.checkInDate && q.checkOutDate),
    staleTime: 60 * 1000,
  })
}
export const { useList: useGuides, useItem: useGuide, useBook: useBookGuide } = makeServiceHooks<Guide>('guides')
export const { useList: useRestaurants, useItem: useRestaurant, useBook: useBookRestaurant } = makeServiceHooks<Restaurant>('restaurants')
export const { useList: useTransfers, useItem: useTransfer, useBook: useBookTransfer } = makeServiceHooks<unknown>('transfers')
export const { useList: useEvents, useItem: useEvent, useBook: useBookEvent } = makeServiceHooks<Event>('events')
