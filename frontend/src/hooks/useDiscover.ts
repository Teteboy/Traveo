import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { Destination, Event } from '@/types/schema'

interface DiscoverResponse {
  videos: { page: number; limit: number; total: number; items: VideoItem[] }
  featuredDestinations: Destination[]
  featuredEvents: Event[]
}

interface VideoItem {
  id: string
  title: string
  videoUrl: string
  thumbnailUrl?: string
  destination?: string
  country?: string
  likes: number
  views: number
  creator?: { id: string; name: string; avatar?: string | null }
}

export function useDiscover(page = 1) {
  return useQuery<DiscoverResponse>({
    queryKey: ['discover', page],
    queryFn: async () => {
      const response = await apiClient.get<DiscoverResponse>(`/discover?page=${page}&limit=10`)
      return response
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useDiscoverVideos(params: { page?: number; country?: string } = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries({ page: 1, limit: 10, ...params }).filter(([, v]) => v).map(([k, v]) => [k, String(v)]))
  ).toString()

  return useQuery<{ page: number; limit: number; total: number; items: VideoItem[] }>({
    queryKey: ['discover', 'videos', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: { page: number; limit: number; total: number; items: VideoItem[] } }>(`/discover/videos?${qs}`)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
