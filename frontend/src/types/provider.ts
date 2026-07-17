// Provider-specific types for the Pro Users dashboard

// Service Types
export type ServiceType = 'hotel' | 'guide' | 'transport' | 'restaurant' | 'events'

// Provider Booking Status
export type ProviderBookingStatus = 'confirmed' | 'checkedin' | 'checkedout' | 'pending' | 'cancelled'

// Verification Status
export type VerificationStatus = 'verified' | 'pending' | 'incomplete' | 'rejected'

// Review Response Status
export type ReviewResponseStatus = 'responded' | 'unresponded'

// Payout Status
export type PayoutStatus = 'completed' | 'pending' | 'failed'

// Message Status
export type MessageStatus = 'read' | 'unread'

// Settings Tab
export type SettingsTab = 'profile' | 'property' | 'security' | 'billing'

// Provider Profile
export interface ProviderProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  role: string // e.g. "Hotel Manager", "Tour Operator"
  businessName: string
  businessType: ServiceType
  verificationProgress: number
  isVerified: boolean
}

// Service Item (generic structure, details vary by type)
export interface ServiceItem {
  id: string
  providerId: string
  serviceType: ServiceType
  name: string
  description: string
  price: number
  currency: string
  availability: boolean
  features: string[]
  images: string[]
  videoUrl?: string
  capacity?: number // for hotels, transport, events
  duration?: string // for tours, events
  createdAt: string
  updatedAt: string
}

// Provider Booking
export interface ProviderBooking {
  id: string
  providerId: string
  serviceId: string
  serviceName: string
  serviceType: ServiceType
  guestName: string
  guestEmail: string
  guestPhone: string
  guestAvatar?: string
  checkInDate: string
  checkOutDate?: string
  guests: number
  status: ProviderBookingStatus
  totalPrice: number
  currency: string
  createdAt: string
  isVIP: boolean
}

// Earnings Record
export interface EarningsRecord {
  id: string
  providerId: string
  period: string // e.g. "Feb 2026"
  totalRevenue: number
  pendingPayments: number
  avgBookingValue: number
  commissionFees: number
  currency: string
  trend: {
    percentage: number
    direction: 'up' | 'down'
    comparedTo: string
  }
}

// Revenue Breakdown Item
export interface RevenueBreakdownItem {
  id: string
  serviceName: string
  guestName: string
  amount: number
  commission: number
  date: string
  status: 'paid' | 'pending'
}

// Provider Review
export interface ProviderReview {
  id: string
  providerId: string
  serviceId: string
  serviceName: string
  serviceType: ServiceType
  guestName: string
  guestAvatar: string
  rating: number
  reviewText: string
  createdAt: string
  responseStatus: ReviewResponseStatus
  response?: {
    text: string
    createdAt: string
  }
}

// Message Thread
export interface MessageThread {
  id: string
  providerId: string
  guestId: string
  guestName: string
  guestAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status: MessageStatus
}

// Message
export interface Message {
  id: string
  threadId: string
  senderId: string
  senderType: 'provider' | 'guest'
  text: string
  timestamp: string
  isRead: boolean
}

// Verification Step
export interface VerificationStep {
  id: string
  name: string
  description: string
  status: VerificationStatus
  icon: string
  requiredDocuments?: string[]
  submittedDocuments?: Array<{
    name: string
    url: string
    uploadedAt: string
  }>
}

// Payout Request
export interface PayoutRequest {
  id: string
  providerId: string
  amount: number
  currency: string
  cardNumber: string
  cardholderName: string
  status: PayoutStatus
  requestedAt: string
  completedAt?: string
  transactionId?: string
}

// Dashboard Stats
export interface DashboardStats {
  totalBookings: {
    count: number
    trend: {
      percentage: number
      direction: 'up' | 'down'
    }
  }
  totalRevenue: {
    amount: number
    currency: string
    trend: {
      percentage: number
      direction: 'up' | 'down'
    }
  }
  activeRooms?: {
    occupied: number
    total: number
    occupancyRate: number
  }
  activeServices?: number
  pendingBookings?: number
  checkinsToday: {
    count: number
    vipCount: number
  }
}

// Service-specific metadata
export interface ServiceMetadata {
  hotel: {
    roomTypes: string[]
    amenities: string[]
    starRating: number
  }
  guide: {
    tourCategories: string[]
    languages: string[]
    groupSizeMax: number
  }
  transport: {
    vehicleTypes: string[]
    seatingCapacity: number
  }
  restaurant: {
    cuisineTypes: string[]
    diningOptions: string[]
    priceRange: string
  }
  events: {
    eventTypes: string[]
    venueCapacity: number
    cateringOptions: boolean
  }
}

// Notification Item
export interface ProviderNotification {
  id: string
  providerId: string
  title: string
  message: string
  type: 'booking' | 'review' | 'message' | 'payout' | 'verification' | 'system'
  isRead: boolean
  createdAt: string
  actionUrl?: string
}
