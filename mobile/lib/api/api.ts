// Centralized API client contracts for the upcoming Traveo Node.js backend.
// This file is intentionally framework-light: it only defines base URLs
// and request/response shapes (TypeScript types) that your app can adopt.
//
// Note: The Flutter app is currently implemented in Dart. This file is a
// reference for backend payload structure and expected endpoints.
// When wiring Flutter, create a Dart version of these contracts.

export type ISODateString = string

// ---------- Transport layer ----------
export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface ApiConfig {
  /** Example: https://api.traveo.com */
  baseUrl: string
  /** API version prefix (recommended): /v1 */
  versionPath?: string
  /** Timeout in ms */
  timeoutMs?: number
}

// ---------- Common response models ----------
export interface ApiError {
  code: string
  message: string
  /** Optional details for debugging/UX */
  details?: Record<string, unknown>
}

export interface ApiMeta {
  requestId?: string
}

export interface ApiResponse<T> {
  data: T
  meta?: ApiMeta
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

// ---------- Provider/admin ----------
export type ProviderServiceType = 'hotel' | 'guide' | 'transport' | 'restaurant' | 'events' | 'flight'

export interface Provider {
  id: string
  companyName: string
  serviceTypes: ProviderServiceType[]
  createdAt: ISODateString
}

// ---------- Flights (Duffel upstream) ----------
export interface FlightSearchParams {
  origin: string
  destination: string
  departDate: ISODateString
  returnDate?: ISODateString
  passengers: number
  cabin?: 'economy' | 'business' | 'first'
  currency?: string
}

export interface FlightOffer {
  /** Internal Traveo offer id (maps to Duffel data) */
  offerId: string
  airline: string
  flightNumber?: string
  origin: string
  destination: string
  departAt: ISODateString
  arriveAt: ISODateString
  durationMinutes: number
  stops: number
  /** Pricing in minor units */
  price: {
    amount: number
    currency: string
  }
  /** Cabin / fare family metadata */
  cabin?: string
  /** Raw Duffel reference for backend revalidation (never expose secrets to clients) */
  duffelRef?: {
    offerId?: string
  }
}

export interface FlightSearchResponse {
  searchId: string
  results: FlightOffer[]
}

export interface FlightBookRequest {
  offerId: string
  /** Passenger & contact info */
  passenger: {
    fullName: string
    email?: string
    phone?: string
  }
  /** Payment selection, typically wallet/money method */
  paymentMethod: {
    type: 'campay_mobile_money'
    provider: 'mtn_momo' | 'orange_money'
    reference?: string
  }
}

export interface FlightBookResponse {
  bookingId: string
  status: 'pending_payment' | 'confirmed' | 'failed'
  ticket?: {
    qrPayload: string
    qrUrl?: string
    issuedAt?: ISODateString
  }
}

// ---------- Common Booking model ----------
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'pending_payment'

type Money = {
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

// ---------- Wallet / Payments (Campay) ----------
export type CurrencyCode = string

export interface WalletBalance {
  currency: CurrencyCode
  amount: number // minor units
}

export interface WalletTransaction {
  id: string
  amount: number // minor units (positive/negative)
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

export interface CampayInitializeRequest {
  /** Local booking id */
  bookingId: string
  /** Total to pay, minor units */
  amount: number
  currency: CurrencyCode
  /** Payment provider */
  provider: 'mtn_momo' | 'orange_money'
  customer: {
    fullName: string
    email?: string
    phone?: string
  }
  /** Client redirect / webhook correlation */
  successUrl?: string
  cancelUrl?: string
}

export interface CampayInitializeResponse {
  paymentId: string
  /** For mobile deep-link or redirect (provider-specific) */
  checkoutUrl?: string
  /** Optional instructions */
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
  /** Provider raw fields */
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
  travelDates?: {
    departAt?: ISODateString
    returnAt?: ISODateString
  }
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
  /** Document slot id / document type */
  documentType: string
  /** File name */
  fileName: string
  /** Client uploads to pre-signed URL */
  contentType?: string
  /** Optional */
  fileSizeBytes?: number
}

export interface VisaPreSignedUrlResponse {
  url: string
  /** When upload should be completed by */
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

// ---------- API endpoint catalog (reference) ----------
export const api = {
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
    txs: (cfg: ApiConfig) => `${cfg.baseUrl}${cfg.versionPath ?? '/v1'}/wallet/transactions`,
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

