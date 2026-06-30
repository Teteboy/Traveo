import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

type DestinationItem = {
  id: string
  name: string
  country: string
  imageUrl: string
  rating?: number
}

type FlightItem = {
  id: string
  origin: string
  destination: string
  airline: string
  durationMinutes: number
  airlineLogo?: string
  priceEconomy?: number
  currency?: string
}

type HotelItem = {
  id: string
  name: string
  location: string
  imageUrl: string
  price?: number
  currency?: string
  rating?: number
}

type EventItem = {
  id: string
  name: string
  location: string
  imageUrl: string
  price?: number
  currency?: string
  rating?: number
}

interface Recommendation {
  id: string
  type: 'destination' | 'flight' | 'hotel' | 'event'
  title: string
  subtitle: string
  imageUrl: string
  price?: number
  currency?: string
  rating?: number
  reason: string
  tags: string[]
}

interface RecommendationsResponse {
  recommendations: Recommendation[]
}

export function usePersonalizedRecommendations(userId?: string) {
  return useQuery<RecommendationsResponse>({
    queryKey: ['recommendations', userId],
    queryFn: async () => {
      // This would ideally be a dedicated recommendations endpoint
      // For now, we'll aggregate data from multiple services
      const [destinations, flights, hotels, events] = await Promise.all([
        apiClient.get<{ items: DestinationItem[] }>('/destinations?page=1&limit=2'),
        apiClient.get<{ items: FlightItem[] }>('/flights?page=1&limit=1'),
        apiClient.get<{ items: HotelItem[] }>('/hotels?page=1&limit=2'),
        apiClient.get<{ items: EventItem[] }>('/events?page=1&limit=1'),
      ])

      const recommendations: Recommendation[] = []

      // Add top destinations
      destinations.items?.slice(0, 1).forEach((dest) => {
        recommendations.push({
          id: `dest-${dest.id}`,
          type: 'destination',
          title: dest.name,
          subtitle: dest.country,
          imageUrl: dest.imageUrl,
          rating: dest.rating,
          reason: 'Destination populaire près de chez vous',
          tags: ['Nature', 'Culture']
        })
      })

      // Add cheapest flights
      flights.items?.slice(0, 1).forEach((flight) => {
        recommendations.push({
          id: `flight-${flight.id}`,
          type: 'flight',
          title: `${flight.origin} → ${flight.destination}`,
          subtitle: `${flight.airline} - ${flight.durationMinutes}min`,
          imageUrl: flight.airlineLogo || 'https://picsum.photos/400/300?random=51',
          price: flight.priceEconomy,
          currency: flight.currency,
          reason: 'Vol économique disponible',
          tags: ['Direct', 'Économique']
        })
      })

      // Add top hotels
      hotels.items?.slice(0, 1).forEach((hotel) => {
        recommendations.push({
          id: `hotel-${hotel.id}`,
          type: 'hotel',
          title: hotel.name,
          subtitle: hotel.location,
          imageUrl: hotel.imageUrl,
          price: hotel.price,
          currency: hotel.currency,
          rating: hotel.rating,
          reason: 'Hôtel très bien noté',
          tags: ['Confort', 'Centre-ville']
        })
      })

      // Add featured events
      events.items?.slice(0, 1).forEach((event) => {
        recommendations.push({
          id: `event-${event.id}`,
          type: 'event',
          title: event.name,
          subtitle: event.location,
          imageUrl: event.imageUrl,
          price: event.price,
          currency: event.currency,
          rating: event.rating,
          reason: 'Événement à ne pas manquer',
          tags: ['Culture', 'Unique']
        })
      })

      return { recommendations }
    },
    enabled: true,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}