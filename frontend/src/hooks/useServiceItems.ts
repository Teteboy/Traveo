import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

interface HotelRoom {
  id: string
  name: string
  price: number
  currency?: string
  maxGuests: number
  available: number
  amenities: string[]
  description: string | null
  imageUrl: string | null
  isActive: boolean
}

interface MenuItem {
  id: string
  name: string
  price: number
  currency?: string
  cuisine: string
  description: string | null
  preparationTime: number | null
  imageUrl: string | null
  dietary: string[]
  isActive: boolean
}

interface Vehicle {
  id: string
  name: string
  price: number
  currency?: string
  capacity: number
  vehicleType: string
  routes: string[]
  features: string[]
  imageUrl: string | null
  isActive: boolean
}

interface Tour {
  id: string
  name: string
  price: number
  currency?: string
  duration: string
  groupSize: number
  languages: string[]
  difficulty: string | null
  description: string | null
  imageUrl: string | null
  isActive: boolean
}

interface EventSpace {
  id: string
  name: string
  price: number
  currency?: string
  capacity: number
  eventType: string
  equipment: string[]
  description: string | null
  imageUrl: string | null
  isActive: boolean
}

export function useHotelRooms(serviceId: string | undefined) {
  return useQuery<HotelRoom[]>({
    queryKey: ['hotel-rooms', serviceId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: HotelRoom[] }>(`/service-items/hotels/${serviceId}/rooms`)
      return response.data || []
    },
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMenuItems(serviceId: string | undefined) {
  return useQuery<MenuItem[]>({
    queryKey: ['menu-items', serviceId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: MenuItem[] }>(`/service-items/restaurants/${serviceId}/menu-items`)
      return response.data || []
    },
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useVehicles(serviceId: string | undefined) {
  return useQuery<Vehicle[]>({
    queryKey: ['vehicles', serviceId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Vehicle[] }>(`/service-items/transfers/${serviceId}/vehicles`)
      return response.data || []
    },
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTours(serviceId: string | undefined) {
  return useQuery<Tour[]>({
    queryKey: ['tours', serviceId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Tour[] }>(`/service-items/guides/${serviceId}/tours`)
      return response.data || []
    },
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useEventSpaces(serviceId: string | undefined) {
  return useQuery<EventSpace[]>({
    queryKey: ['event-spaces', serviceId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: EventSpace[] }>(`/service-items/events/${serviceId}/spaces`)
      return response.data || []
    },
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000,
  })
}
