import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { FlightWithDetails, Seat, SeatClass } from '@/lib/types'

export type BookingStep = 'search' | 'select-flight' | 'select-seat' | 'passenger-details' | 'confirmation'

interface SearchQuery {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  passengers: number
  seatClass: SeatClass
}

interface PassengerFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  passport_number: string
  nationality: string
  date_of_birth: string
  is_primary: boolean
  seat_id: string
}

interface FlightStore {
  // State
  searchParams: SearchQuery
  selectedFlight: FlightWithDetails | null
  selectedSeats: Seat[]
  currentStep: BookingStep
  passengers: PassengerFormData[]
  bookingId: string | null
  pnrCode: string | null
  
  // Actions
  setSearchParams: (params: Partial<SearchQuery>) => void
  setSelectedFlight: (flight: FlightWithDetails | null) => void
  
  // Seat selection (with optimistic updates)
  addSeat: (seat: Seat) => void
  addSeatOptimistically: (seat: Seat) => void
  confirmSeatSelection: (seatId: string) => void
  removeSeat: (seatId: string) => void
  clearSeats: () => void
  
  setCurrentStep: (step: BookingStep) => void
  setPassengers: (forms: PassengerFormData[]) => void
  updatePassenger: (index: number, data: Partial<PassengerFormData>) => void
  setBookingComplete: (bookingId: string, pnrCode: string) => void
  
  // Reset store (on cancellation/logout)
  reset: () => void
  resetStore: () => void
}

const initialState = {
  searchParams: {
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    seatClass: 'economy' as SeatClass,
  },
  selectedFlight: null,
  selectedSeats: [],
  currentStep: 'search' as BookingStep,
  passengers: [],
  bookingId: null,
  pnrCode: null,
}

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      setSearchParams: (params) =>
        set((state) => ({
          searchParams: { ...state.searchParams, ...params },
        })),
      
      setSelectedFlight: (flight) =>
        set({ 
          selectedFlight: flight,
          selectedSeats: [], // Clear seats when flight changes
          currentStep: flight ? 'select-seat' : 'select-flight',
        }),
      
      // Regular seat addition (compatible with old API)
      addSeat: (seat) =>
        set((state) => ({
          selectedSeats: [...state.selectedSeats, seat],
        })),
      
      // Optimistic seat selection - mark immediately in UI
      addSeatOptimistically: (seat) =>
        set((state) => ({
          selectedSeats: [...state.selectedSeats, seat],
        })),
      
      // Confirm seat after Supabase confirms
      confirmSeatSelection: (seatId) =>
        set((state) => ({
          selectedSeats: state.selectedSeats.map(seat =>
            seat.id === seatId ? seat : seat
          ),
        })),
      
      removeSeat: (seatId) =>
        set((state) => ({
          selectedSeats: state.selectedSeats.filter(s => s.id !== seatId),
        })),
      
      clearSeats: () => set({ selectedSeats: [] }),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      setPassengers: (forms) => set({ passengers: forms }),
      
      updatePassenger: (index, data) =>
        set((state) => {
          const updated = [...state.passengers]
          updated[index] = { ...updated[index], ...data }
          return { passengers: updated }
        }),
      
      setBookingComplete: (bookingId, pnrCode) =>
        set({ bookingId, pnrCode }),
      
      // Reset entire store (both names for compatibility)
      reset: () => set(initialState),
      resetStore: () => set(initialState),
    }),
    {
      name: 'flight-booking-storage',
      // Partialize: EXCLUDE passport_number from persisted data for security
      partialize: (state) => ({
        searchParams: state.searchParams,
        selectedFlight: state.selectedFlight,
        selectedSeats: state.selectedSeats,
        currentStep: state.currentStep,
        // Exclude passport_number from passenger forms
        passengers: state.passengers.map(form => ({
          ...form,
          passport_number: '', // Don't persist passport numbers
        })),
      }),
    }
  )
)

// Helper to calculate total price (for compatibility)
export function calculateTotalPrice(
  flight: FlightWithDetails | null,
  seats: Seat[],
  seatClass: SeatClass
): number {
  if (!flight) return 0
  
  const basePrice = seatClass === 'first' 
    ? (flight.first_class_price || flight.base_price * 3)
    : seatClass === 'business'
      ? (flight.business_price || flight.base_price * 2)
      : flight.base_price
  
  const seatModifiers = seats.reduce((sum, seat) => sum + Number(seat.price_modifier), 0)
  
  return (basePrice * seats.length) + seatModifiers
}

// Generate PNR code (for compatibility)
export function generatePNR(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let pnr = ''
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pnr
}
