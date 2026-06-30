import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

type AdminFlight = {
  id: string
  airline: string
  airlineLogo?: string | null
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
  priceBusiness?: number | null
  currency: string
  availableSeats: number
  isActive: boolean
  createdAt: string
}

type PaginatedResponse<T> = {
  page: number
  limit: number
  total: number
  items: T[]
}

type AdminVisaApplication = {
  id: string
  userId: string
  countryCode: string
  countryName: string
  status: string
  applicantData: unknown
  travelDates: unknown
  processingFee?: number | null
  createdAt: string
  updatedAt: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

type AdminStatsResponse = {
  data: {
    users: number
    providers: number
    bookings: number
    totalRevenue: number
    activeFlights: number
    visaApplications: number
  }
}

type AdminAnalyticsResponse = {
  data: {
    bookingsByType: Array<{ serviceType: string; _count: { id: number }; _sum: { totalAmount: number | null } }>
    revenueByMonth: Array<{ month: string; revenue: string | number; count: string | number }>
    topDestinations: Array<{ id: string; name: string; popularityScore: number }>
  }
}

type AdminUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: string
  country: string
  createdAt: string
  fullName: string
}

type AdminUsersResponse = {
  page: number
  limit: number
  total: number
  items: AdminUser[]
}

export function useAdminStats() {
  return useQuery<AdminStatsResponse>({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.get<AdminStatsResponse>('/admin/stats'),
    staleTime: 60 * 1000,
  })
}

export function useAdminAnalytics() {
  return useQuery<AdminAnalyticsResponse>({
    queryKey: ['admin-analytics'],
    queryFn: () => apiClient.get<AdminAnalyticsResponse>('/admin/analytics'),
    staleTime: 60 * 1000,
  })
}

export function useAdminUsers(params: { page: number; limit: number; role?: string; search?: string }) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    ...(params.role && params.role !== 'all' ? { role: params.role } : {}),
    ...(params.search ? { search: params.search } : {}),
  }).toString()

  return useQuery<AdminUsersResponse>({
    queryKey: ['admin-users', params],
    queryFn: () => apiClient.get<AdminUsersResponse>(`/admin/users?${query}`),
    staleTime: 30 * 1000,
  })
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export function useAdminFlights(params: { page: number; limit: number; includeDuffel?: boolean; origin?: string; destination?: string; departDate?: string }) {
  const query = new URLSearchParams({ 
    page: String(params.page), 
    limit: String(params.limit),
    ...(params.includeDuffel !== undefined ? { includeDuffel: String(params.includeDuffel) } : {}),
    ...(params.origin ? { origin: params.origin } : {}),
    ...(params.destination ? { destination: params.destination } : {}),
    ...(params.departDate ? { departDate: params.departDate } : {}),
  }).toString()
  return useQuery<PaginatedResponse<AdminFlight>>({
    queryKey: ['admin-flights', params],
    queryFn: () => apiClient.get<PaginatedResponse<AdminFlight>>(`/admin/flights?${query}`),
    staleTime: 30 * 1000,
  })
}

export function useCreateAdminFlight() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<AdminFlight, 'id' | 'createdAt' | 'isActive'> & { isActive?: boolean }) =>
      apiClient.post<{ data: AdminFlight }>('/admin/flights', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flights'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export function useUpdateAdminFlight() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminFlight> }) =>
      apiClient.patch<{ data: AdminFlight }>(`/admin/flights/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flights'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export function useDeleteAdminFlight() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<{ data: { message: string } }>(`/admin/flights/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flights'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export function useAdminVisaApplications(params: { page: number; limit: number; status?: string }) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    ...(params.status && params.status !== 'all' ? { status: params.status } : {}),
  }).toString()

  return useQuery<PaginatedResponse<AdminVisaApplication>>({
    queryKey: ['admin-visa', params],
    queryFn: () => apiClient.get<PaginatedResponse<AdminVisaApplication>>(`/admin/visa?${query}`),
    staleTime: 30 * 1000,
  })
}

export function useUpdateAdminVisaStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch<{ data: AdminVisaApplication }>(`/admin/visa/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-visa'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

type AdminFinancialResponse = {
  data: {
    totalRevenue: number
    monthlyRevenue: number
    pendingSettlements: number
    pendingRefunds: number
    pendingRefundCount: number
    activeWallets: number
    totalCommissions: number
    paymentsCount: number
    currency: string
  }
}

type AdminPayment = {
  id: string
  bookingId: string
  amount: number
  currency: string
  provider: string
  status: string
  externalId: string | null
  completedAt: string | null
  createdAt: string
  userName: string
  userEmail: string
}

type AdminRefund = {
  id: string
  bookingId: string
  amount: number
  currency: string
  reason: string
  status: string
  estimatedDate: string | null
  completedDate: string | null
  createdAt: string
  booking?: { userId: string; user?: { firstName: string; lastName: string; email: string } }
}

export function useAdminFinancial() {
  return useQuery<AdminFinancialResponse>({
    queryKey: ['admin-financial'],
    queryFn: () => apiClient.get<AdminFinancialResponse>('/admin/financial'),
    staleTime: 60 * 1000,
  })
}

export function useAdminPayments(params: { page: number; limit: number; status?: string }) {
  const qs = new URLSearchParams({
    page: String(params.page), limit: String(params.limit),
    ...(params.status && params.status !== 'all' ? { status: params.status } : {}),
  }).toString()
  return useQuery<PaginatedResponse<AdminPayment>>({
    queryKey: ['admin-payments', params],
    queryFn: () => apiClient.get<PaginatedResponse<AdminPayment>>(`/admin/payments?${qs}`),
    staleTime: 30 * 1000,
  })
}

export function useAdminRefunds(params: { page: number; limit: number; status?: string }) {
  const qs = new URLSearchParams({
    page: String(params.page), limit: String(params.limit),
    ...(params.status && params.status !== 'all' ? { status: params.status } : {}),
  }).toString()
  return useQuery<PaginatedResponse<AdminRefund>>({
    queryKey: ['admin-refunds', params],
    queryFn: () => apiClient.get<PaginatedResponse<AdminRefund>>(`/admin/refunds?${qs}`),
    staleTime: 30 * 1000,
  })
}

export function useUpdateAdminRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch(`/admin/refunds/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-refunds'] })
      queryClient.invalidateQueries({ queryKey: ['admin-financial'] })
    },
  })
}

type AdminService = {
  id: string
  providerId: string | null
  type: string
  name: string
  description: string
  imageUrl: string
  location: string
  country: string
  rating: number
  reviewCount: number
  price: number
  currency: string
  isActive: boolean
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  provider?: { id: string; companyName: string; isVerified: boolean; user?: { firstName: string; lastName: string; email: string } } | null
}

export function useAdminServices(params: { page: number; limit: number; type?: string; isActive?: boolean }) {
  const qs = new URLSearchParams({
    page: String(params.page), limit: String(params.limit),
    ...(params.type && params.type !== 'all' ? { type: params.type } : {}),
    ...(params.isActive !== undefined ? { isActive: String(params.isActive) } : {}),
  }).toString()
  return useQuery<PaginatedResponse<AdminService>>({
    queryKey: ['admin-services', params],
    queryFn: () => apiClient.get<PaginatedResponse<AdminService>>(`/admin/services?${qs}`),
    staleTime: 30 * 1000,
  })
}

export function useUpdateAdminService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch(`/admin/services/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export function useDeleteAdminService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
    },
  })
}

