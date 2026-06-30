/**
 * Adapters — maps backend API responses to the UI schema shapes
 * The backend stores Hotels/Guides/Restaurants/Events/Transfers as generic "services"
 * with a `metadata` JSON field for type-specific data.
 */

import type { Hotel, Guide, Restaurant, Event } from '@/types/schema'

// ─── Flight adapter ───────────────────────────────────────────────────────────

export interface ApiFlightItem {
  id: string
  airline: string
  airlineLogo?: string
  flightNumber: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  departAt: string
  arriveAt: string
  durationMinutes: number
  stops: number
  priceEconomy: number
  priceBusiness?: number
  currency: string
  availableSeats: number
}

export function adaptFlight(f: ApiFlightItem) {
  const depart = new Date(f.departAt)
  const arrive = new Date(f.arriveAt)
  const durationH = Math.floor(f.durationMinutes / 60)
  const durationM = f.durationMinutes % 60
  return {
    id: f.id,
    airline: f.airline,
    airlineLogo: f.airlineLogo ?? `https://logo.clearbit.com/${f.airline.toLowerCase().replace(/\s+/g, '')}.com`,
    flightNumber: f.flightNumber,
    departure: {
      airport: f.origin,
      code: f.originCode,
      time: depart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      date: depart.toISOString().split('T')[0],
    },
    arrival: {
      airport: f.destination,
      code: f.destinationCode,
      time: arrive.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      date: arrive.toISOString().split('T')[0],
    },
    duration: `${durationH}h${durationM > 0 ? ` ${durationM}m` : ''}`,
    price: { economy: f.priceEconomy, business: f.priceBusiness },
    currency: f.currency,
    stops: f.stops,
    availableSeats: f.availableSeats,
  }
}

// ─── Hotel adapter ────────────────────────────────────────────────────────────

export interface ApiServiceItem {
  id: string
  name: string
  description: string
  imageUrl: string
  location: string
  country: string
  rating: number
  reviewCount: number
  price: number
  currency: string
  metadata: Record<string, unknown>
  providerId?: string
}

export function adaptHotel(s: ApiServiceItem): Hotel & { starRating: number; availableRooms: number; providerId?: string } {
  const meta = (s.metadata ?? {}) as Record<string, unknown>
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    imageUrl: s.imageUrl,
    location: s.location,
    country: s.country,
    rating: s.rating,
    reviewCount: s.reviewCount,
    price: s.price,
    currency: s.currency,
    amenities: (meta.amenities as string[]) ?? [],
    starRating: (meta.starRating as number) ?? 3,
    availableRooms: (meta.availableRooms as number) ?? 10,
    providerId: s.providerId,
  }
}

export function adaptGuide(s: ApiServiceItem): Guide & { providerId?: string } {
  const meta = (s.metadata ?? {}) as Record<string, unknown>
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    imageUrl: s.imageUrl,
    location: s.location,
    country: s.country,
    rating: s.rating,
    reviewCount: s.reviewCount,
    languages: (meta.languages as string[]) ?? [],
    specialties: (meta.specialties as string[]) ?? [],
    pricePerHour: (meta.pricePerHour as number) ?? s.price,
    currency: s.currency,
    providerId: s.providerId,
  }
}

export function adaptRestaurant(s: ApiServiceItem): Restaurant & { providerId?: string } {
  const meta = (s.metadata ?? {}) as Record<string, unknown>
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    imageUrl: s.imageUrl,
    location: s.location,
    country: s.country,
    rating: s.rating,
    reviewCount: s.reviewCount,
    cuisine: (meta.cuisine as string) ?? 'Internationale',
    priceRange: (meta.priceRange as string) ?? '$$',
    averagePrice: s.price,
    currency: s.currency,
    providerId: s.providerId,
  }
}

export function adaptEvent(s: ApiServiceItem): Event & { availableTickets: number; providerId?: string } {
  const meta = (s.metadata ?? {}) as Record<string, unknown>
  return {
    id: s.id,
    title: s.name,
    description: s.description,
    imageUrl: s.imageUrl,
    location: s.location,
    country: s.country,
    startDate: (meta.startDate as string) ?? new Date().toISOString(),
    endDate: (meta.endDate as string) ?? new Date().toISOString(),
    price: s.price,
    currency: s.currency,
    category: (meta.category as string) ?? 'Culture',
    availableTickets: (meta.availableTickets as number) ?? 100,
    providerId: s.providerId,
  }
}

export function adaptTransfer(s: ApiServiceItem) {
  const meta = (s.metadata ?? {}) as Record<string, unknown>
  const route = ((meta.route as string) ?? `${s.location}`).split('-')
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    imageUrl: s.imageUrl,
    type: 'airport_transfer',
    from: route[0]?.trim() ?? s.location,
    to: route[1]?.trim() ?? s.country,
    price: s.price,
    currency: s.currency,
    duration: '1h 30min',
    capacity: (meta.seatingCapacity as number) ?? 4,
  }
}
