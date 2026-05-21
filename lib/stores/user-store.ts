import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { BookingWithDetails } from '@/lib/types'

interface CachedBooking {
  id: string
  pnr_code: string
  status: string
  flight_id: string
  total_price: number
  booked_at: string
}

interface UserStore {
  // State
  sessionToken: string | null
  cachedBookings: CachedBooking[]
  
  // Actions
  setSessionToken: (token: string | null) => void
  setCachedBookings: (bookings: CachedBooking[]) => void
  addCachedBooking: (booking: CachedBooking) => void
  updateCachedBooking: (bookingId: string, updates: Partial<CachedBooking>) => void
  removeCachedBooking: (bookingId: string) => void
  clearUserData: () => void
}

const initialState = {
  sessionToken: null,
  cachedBookings: [],
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      setSessionToken: (token) => set({ sessionToken: token }),
      
      setCachedBookings: (bookings) => set({ cachedBookings: bookings }),
      
      addCachedBooking: (booking) =>
        set((state) => ({
          cachedBookings: [booking, ...state.cachedBookings],
        })),
      
      updateCachedBooking: (bookingId, updates) =>
        set((state) => ({
          cachedBookings: state.cachedBookings.map(b =>
            b.id === bookingId ? { ...b, ...updates } : b
          ),
        })),
      
      removeCachedBooking: (bookingId) =>
        set((state) => ({
          cachedBookings: state.cachedBookings.filter(b => b.id !== bookingId),
        })),
      
      clearUserData: () => set(initialState),
    }),
    {
      name: 'user-storage',
      // Only persist session token, not cached bookings (they'll be fetched fresh)
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        cachedBookings: [], // Don't persist bookings
      }),
    }
  )
)
