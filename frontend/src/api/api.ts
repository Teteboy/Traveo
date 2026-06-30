/*
 * Traveo — Web (React) API contracts + endpoint catalog
 *
 * This file is framework-light: it defines:
 *  - shared request/response TypeScript types
 *  - a centralized endpoint builder (paths + base URL)
 *
 * The app currently uses mock data. When backend is integrated,
 * these contracts are the source of truth for payload shapes.
 */

export type ISODateString = string

export interface ApiConfig {
  /**
   * @deprecated baseUrl is kept for compatibility.
   * Prefer to define base URL in your HTTP client layer.
   */
  baseUrl: string // e.g. https://api.traveo.com
  versionPath?: string // default: /v1
  timeoutMs?: number
}


export interface ApiMeta {
  requestId?: string
}

export interface ApiResponse<T> {
  data: T
  meta?: ApiMeta
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// ---------- Auth ----------
export type Role = 'user' | 'provider' | 'admin'

export interface UserProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  role: Role
  avatarUrl?: string
  createdAt: ISODateString
  // Flight booking fields
  title?: string
  dateOfBirth?: string
  gender?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: UserProfile
  tokens: AuthTokens
}

export interface RefreshRequest {
  refreshToken: string
}

export interface MeResponse {
  user: UserProfile
}

// ---------- Providers / Services ----------
export type ProviderServiceType = 'hotel' | 'guide' | 'transport' | 'restaurant' | 'events' | 'flight'

export interface Provider {
  id: string
  companyName: string
  serviceTypes: ProviderServiceType[]
  createdAt: ISODateString
}

// ---------- Flights (Duffel) ----------
export type FlightCabin = 'economy' | 'business' | 'first'

export interface FlightSearchParams {
  origin: string
  destination: string
  departDate: ISODateString
  returnDate?: ISODateString
  passengers: number
  cabin?: FlightCabin
  currency?: string
}

export interface FlightOffer {
  offerId: string
  airline: string
  flightNumber?: string
  origin: string
  destination: string
  departAt: ISODateString
  arriveAt: ISODateString
  durationMinutes: number
  stops: number
  price: { amount: number; currency: string } // minor units
  cabin?: string
  duffelRef?: { offerId?: string }
}

export interface FlightSearchResponse {
  searchId: string
  results: FlightOffer[]
}

export interface FlightBookRequest {
  offerId: string
  cabin?: string
  passenger: { fullName: string; email?: string; phone?: string }
  paymentMethod: {
    type: 'campay_mobile_money' | 'balance'
    provider?: 'mtn_momo' | 'orange_money'
    reference?: string
  }
}

export interface FlightBookResponse {
  bookingId: string
  status: 'pending_payment' | 'confirmed' | 'failed'
  duffelOrderId?: string
  bookingReference?: string
  ticket?: {
    qrPayload: string
    qrUrl?: string
    issuedAt?: ISODateString
  }
}

// ---------- Bookings ----------
export type BookingStatus =
  | 'pending'
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed'

export interface Money {
  amount: number // minor units
  currency: string
}

export interface Booking {
  id: string
  userId: string
  serviceType: ProviderServiceType | 'flight'
  serviceId: string
  providerId?: string
  status: BookingStatus
  createdAt: ISODateString
  updatedAt: ISODateString
  total: Money
}

export interface BookingListResponse {
  page: number
  limit: number
  total: number
  items: Booking[]
}

// ---------- Wallet (ledger) ----------
export type CurrencyCode = string

export interface WalletBalance {
  currency: CurrencyCode
  amount: number // minor units
}

export interface WalletTransaction {
  id: string
  amount: number // minor units
  currency: CurrencyCode
  type: 'credit' | 'debit' | 'refund'
  status: 'pending' | 'completed' | 'failed'
  createdAt: ISODateString
  metadata?: Record<string, unknown>
}

export interface WalletBalanceResponse {
  balances: WalletBalance[]
}

export interface WalletTransactionsResponse {
  page: number
  limit: number
  total: number
  items: WalletTransaction[]
}

// ---------- Campay payments ----------
export interface CampayInitializeRequest {
  bookingId: string
  amount: number // minor units
  currency: CurrencyCode
  provider: 'mtn_momo' | 'orange_money'
  customer: { fullName: string; email?: string; phone?: string }
  successUrl?: string
  cancelUrl?: string
}

export interface CampayInitializeResponse {
  paymentId: string
  checkoutUrl?: string
  message?: string
  expiresAt?: ISODateString
}

export interface CampayWebhookPayload {
  paymentId: string
  bookingId?: string
  status: 'pending' | 'completed' | 'failed'
  amount: number
  currency: CurrencyCode
  provider: 'mtn_momo' | 'orange_money'
  raw?: Record<string, unknown>
}

// ---------- e-Visa ----------
export interface VisaDestination {
  countryCode: string
  countryName: string
}

export interface VisaRequirement {
  documentType: string
  label: string
  required: boolean
  acceptedFormats: string[]
  maxSizeBytes: number
}

export interface VisaEligibilityResponse {
  countryCode: string
  eligible: boolean
  reasons?: string[]
  requirements: VisaRequirement[]
}

export interface VisaApplication {
  id: string
  userId: string
  countryCode: string
  status: 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected'
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface VisaCreateRequest {
  countryCode: string
  travelDates?: { departAt?: ISODateString; returnAt?: ISODateString }
  applicant: {
    fullName: string
    passportNumber?: string
    nationality?: string
    phone?: string
    email?: string
  }
}

export interface VisaCreateResponse {
  application: VisaApplication
}

export interface VisaDocumentUploadRequest {
  documentType: string
  fileName: string
  contentType?: string
  fileSizeBytes?: number
}

export interface VisaPreSignedUrlResponse {
  url: string
  expiresAt: ISODateString
}

// ---------- Notifications ----------
export type NotificationType =
  | 'booking'
  | 'payment'
  | 'visa'
  | 'reminder'
  | 'system'
  | 'promotion'

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: ISODateString
  metadata?: Record<string, unknown>
}

export interface NotificationsResponse {
  page: number
  limit: number
  total: number
  items: NotificationItem[]
}

// ---------- Endpoint catalog ----------
export const endpoints = {
  auth: {
    login: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/auth/login`,
    refresh: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/auth/refresh`,
    logout: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/auth/logout`,
    me: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/auth/me`,
  },
  flights: {
    search: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/flights/search`,
    get: (cfg: ApiConfig, flightId: string) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/flights/${flightId}`,
    book: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/flights/book`,
  },
  bookings: {
    list: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/bookings`,
    get: (cfg: ApiConfig, bookingId: string) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/bookings/${bookingId}`,
    cancel: (cfg: ApiConfig, bookingId: string) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/bookings/${bookingId}`,
    ticket: (cfg: ApiConfig, bookingId: string) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/bookings/${bookingId}/ticket`,
  },
  wallet: {
    balance: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/wallet/balance`,
    addFunds: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/wallet/add-funds`,
    withdraw: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/wallet/withdraw`,
    transactions: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/wallet/transactions`,
  },
  payments: {
    campayInitialize: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/payments/campay/initialize`,
    campayWebhook: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/payments/campay/webhooks`,
  },
  visa: {
    destinations: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/visa/destinations`,
    requirements: (cfg: ApiConfig, countryCode: string) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/visa/${countryCode}/requirements`,
    createApplication: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/visa/applications`,
    getApplication: (cfg: ApiConfig, applicationId: string) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/visa/applications/${applicationId}`,
    uploadDocument: (cfg: ApiConfig, applicationId: string) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/visa/applications/${applicationId}/documents`,
  },
  notifications: {
    list: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/notifications`,
    markRead: (cfg: ApiConfig, notificationId: string) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/notifications/${notificationId}/read`,
  },
} as const

