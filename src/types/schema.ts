import type { BookingType, BookingStatus, PaymentStatus, VisaStatus } from './enums'

// Core data types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  phone?: string
  country: string
  // Flight booking fields
  title?: string
  dateOfBirth?: string
  gender?: string
}

export interface Destination {
  id: string
  name: string
  country: string
  imageUrl: string
  description: string
  rating: number
  reviewCount: number
  popularityScore: number
}

export interface Flight {
  id: string
  airline: string
  airlineLogo: string
  flightNumber: string
  departure: {
    airport: string
    code: string
    time: string
    date: string
  }
  arrival: {
    airport: string
    code: string
    time: string
    date: string
  }
  duration: string
  price: {
    economy: number
    business?: number
  }
  currency: string
  stops: number
  availableSeats: number
}

export interface Booking {
  id: string
  userId: string
  type: BookingType
  status: BookingStatus
  paymentStatus: PaymentStatus
  startDate: string
  endDate?: string
  totalPrice: number
  currency: string
  details: any // type-specific details
  qrCode?: string
  ticketUrl?: string
}

export interface VisaApplication {
  id: string
  userId: string
  destinationCountry: string
  status: VisaStatus
  submittedAt: string
  processingTime: number
  fee: number
  documents: VisaDocument[]
}

export interface VisaDocument {
  id: string
  applicationId: string
  type: string
  fileName: string
  fileUrl: string
  uploadedAt: string
}

export interface WalletTransaction {
  id: string
  userId: string
  type: 'credit' | 'debit'
  amount: number
  currency: string
  description: string
  status: 'completed' | 'pending' | 'failed'
  createdAt: string
}

export interface Event {
  id: string
  title: string
  description: string
  imageUrl: string
  location: string
  country: string
  startDate: string
  endDate: string
  price: number
  currency: string
  category: string
  availableTickets: number
}

export interface Hotel {
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
  amenities: string[]
  starRating: number
  availableRooms: number
  providerId?: string
}

export interface Guide {
  id: string
  name: string
  description: string
  imageUrl: string
  location: string
  country: string
  rating: number
  reviewCount: number
  languages: string[]
  specialties: string[]
  pricePerHour: number
  currency: string
  providerId?: string
}

export interface Restaurant {
  id: string
  name: string
  description: string
  imageUrl: string
  location: string
  country: string
  rating: number
  reviewCount: number
  cuisine: string
  priceRange: string
  averagePrice: number
  currency: string
}
