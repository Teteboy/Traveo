import { create } from 'zustand'
import { apiClient } from '@/lib/apiClient'
import type {
  ServiceItem,
  ProviderBooking,
  ProviderReview,
  MessageThread,
  Message,
  VerificationStep,
  DashboardStats,
  EarningsRecord,
  RevenueBreakdownItem,
  ProviderNotification,
  ServiceType,
  ProviderBookingStatus,
} from '@/types/provider'

interface ProviderDataState {
  dashboardStats: DashboardStats | null
  recentBookings: ProviderBooking[]
  services: ServiceItem[]
  selectedService: ServiceItem | null
  bookings: ProviderBooking[]
  bookingFilter: ProviderBookingStatus | 'all'
  earnings: EarningsRecord | null
  revenueBreakdown: RevenueBreakdownItem[]
  reviews: ProviderReview[]
  overallRating: { average: number; total: number; distribution: { [key: number]: number } }
  messageThreads: MessageThread[]
  currentThread: MessageThread | null
  messages: Message[]
  verificationSteps: VerificationStep[]
  notifications: ProviderNotification[]
  unreadNotificationCount: number
  isLoading: boolean

  setDashboardStats: (stats: DashboardStats) => void
  setRecentBookings: (bookings: ProviderBooking[]) => void
  setServices: (services: ServiceItem[]) => void
  setSelectedService: (service: ServiceItem | null) => void
  addService: (service: ServiceItem) => void
  updateService: (id: string, updates: Partial<ServiceItem>) => void
  deleteService: (id: string) => void
  setBookings: (bookings: ProviderBooking[]) => void
  setBookingFilter: (filter: ProviderBookingStatus | 'all') => void
  updateBookingStatus: (id: string, status: ProviderBookingStatus) => void
  setEarnings: (earnings: EarningsRecord) => void
  setRevenueBreakdown: (breakdown: RevenueBreakdownItem[]) => void
  setReviews: (reviews: ProviderReview[]) => void
  respondToReview: (reviewId: string, response: string) => void
  setMessageThreads: (threads: MessageThread[]) => void
  setCurrentThread: (thread: MessageThread | null) => void
  setMessages: (messages: Message[]) => void
  sendMessage: (text: string) => void
  markThreadAsRead: (threadId: string) => void
  setVerificationSteps: (steps: VerificationStep[]) => void
  updateVerificationStep: (stepId: string, updates: Partial<VerificationStep>) => void
  setNotifications: (notifications: ProviderNotification[]) => void
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
}

export const useProviderDataStore = create<ProviderDataState>((set) => ({
  dashboardStats: null,
  recentBookings: [],
  services: [],
  selectedService: null,
  bookings: [],
  bookingFilter: 'all',
  earnings: null,
  revenueBreakdown: [],
  reviews: [],
  overallRating: { average: 0, total: 0, distribution: {} },
  messageThreads: [],
  currentThread: null,
  messages: [],
  verificationSteps: [],
  notifications: [],
  unreadNotificationCount: 0,
  isLoading: false,

  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  setRecentBookings: (bookings) => set({ recentBookings: bookings }),
  setServices: (services) => set({ services }),
  setSelectedService: (service) => set({ selectedService: service }),
  addService: (service) => set((state) => ({ services: [...state.services, service] })),
  updateService: (id, updates) => set((state) => ({ services: state.services.map((s) => (s.id === id ? { ...s, ...updates } : s)) })),
  deleteService: (id) => set((state) => ({ services: state.services.filter((s) => s.id !== id) })),
  setBookings: (bookings) => set({ bookings }),
  setBookingFilter: (filter) => set({ bookingFilter: filter }),
  updateBookingStatus: (id, status) => set((state) => ({ bookings: state.bookings.map((b) => (b.id === id ? { ...b, status } : b)) })),
  setEarnings: (earnings) => set({ earnings }),
  setRevenueBreakdown: (breakdown) => set({ revenueBreakdown: breakdown }),
  setReviews: (reviews) => {
    const total = reviews.length
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    const average = total > 0 ? sum / total : 0
    const distribution: { [key: number]: number } = {}
    reviews.forEach((r) => { distribution[r.rating] = (distribution[r.rating] || 0) + 1 })
    set({ reviews, overallRating: { average, total, distribution } })
  },
  respondToReview: (reviewId, response) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === reviewId ? { ...r, responseStatus: 'responded', response: { text: response, createdAt: new Date().toISOString() } } : r
      ),
    })),
  setMessageThreads: (threads) => set({ messageThreads: threads }),
  setCurrentThread: (thread) => set({ currentThread: thread }),
  setMessages: (messages) => set({ messages }),
  sendMessage: (text) =>
    set((state) => {
      if (!state.currentThread) return state
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        threadId: state.currentThread.id,
        senderId: 'provider',
        senderType: 'provider',
        text,
        timestamp: new Date().toISOString(),
        isRead: true,
      }
      return { messages: [...state.messages, newMessage] }
    }),
  markThreadAsRead: (threadId) =>
    set((state) => ({
      messageThreads: state.messageThreads.map((t) => (t.id === threadId ? { ...t, unreadCount: 0, status: 'read' as const } : t)),
    })),
  setVerificationSteps: (steps) => set({ verificationSteps: steps }),
  updateVerificationStep: (stepId, updates) =>
    set((state) => ({ verificationSteps: state.verificationSteps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)) })),
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.isRead).length
    set({ notifications, unreadNotificationCount: unreadCount })
  },
  markNotificationAsRead: (notificationId) =>
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      return { notifications: updated, unreadNotificationCount: updated.filter((n) => !n.isRead).length }
    }),
  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadNotificationCount: 0,
    })),
}))

// Load provider dashboard data from real API
export const loadProviderDashboardData = async (_serviceType: ServiceType) => {
  const { setDashboardStats, setRecentBookings } = useProviderDataStore.getState()
  try {
    const [statsRes, bookingsRes] = await Promise.all([
      apiClient.get<{ data: { totalBookings: DashboardStats['totalBookings']; totalRevenue: DashboardStats['totalRevenue']; activeServices: number; pendingBookings: number } }>('/providers/dashboard'),
      apiClient.get<{ page: number; limit: number; total: number; items: ProviderBooking[] }>('/providers/bookings?limit=5'),
    ])
    setDashboardStats({
      totalBookings: statsRes.data.totalBookings,
      totalRevenue: statsRes.data.totalRevenue,
      activeServices: statsRes.data.activeServices,
      pendingBookings: statsRes.data.pendingBookings,
      checkinsToday: { count: statsRes.data.pendingBookings, vipCount: 0 },
    })
    setRecentBookings(bookingsRes.items ?? [])
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    // Fallback to empty stats
    setDashboardStats({ totalBookings: { count: 0, trend: { percentage: 0, direction: 'up' } }, totalRevenue: { amount: 0, currency: 'XAF', trend: { percentage: 0, direction: 'up' } }, activeServices: 0, pendingBookings: 0, checkinsToday: { count: 0, vipCount: 0 } })
    setRecentBookings([])
  }
}
