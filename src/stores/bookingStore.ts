import { create } from 'zustand'
import type { Booking } from '@/types/schema'

interface BookingState {
  bookings: Booking[]
  addBooking: (booking: Booking) => void
  updateBooking: (id: string, updates: Partial<Booking>) => void
  getBookingById: (id: string) => Booking | undefined
  getUserBookings: (userId: string) => Booking[]
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  addBooking: (booking) =>
    set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBooking: (id, updates) =>
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === id ? { ...booking, ...updates } : booking
      ),
    })),
  getBookingById: (id) => {
    return get().bookings.find((booking) => booking.id === id)
  },
  getUserBookings: (userId) => {
    return get().bookings.filter((booking) => booking.userId === userId)
  },
}))
