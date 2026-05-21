/**
 * @deprecated Use lib/stores/flight-store.ts and lib/stores/user-store.ts instead
 * This file is kept for backward compatibility but should not be used in new code.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FlightWithDetails, Seat, Passenger, SeatClass } from './types'

interface BookingState {
  // Search
  searchParams: {
    origin: string
    destination: string
    departureDate: string
    returnDate: string
    passengers: number
    seatClass: SeatClass
  }
  
  // Selected flight
  selectedFlight: FlightWithDetails | null
  
  // Selected seats
  selectedSeats: Seat[]
  
  // Passengers
  passengers: Omit<Passenger, 'id' | 'booking_id' | 'created_at'>[]
  
  // Booking
  bookingId: string | null
  pnrCode: string | null
  
  // Actions
  setSearchParams: (params: Partial<BookingState['searchParams']>) => void
  setSelectedFlight: (flight: FlightWithDetails | null) => void
  addSeat: (seat: Seat) => void
  removeSeat: (seatId: string) => void
  clearSeats: () => void
  setPassengers: (passengers: BookingState['passengers']) => void
  updatePassenger: (index: number, data: Partial<BookingState['passengers'][0]>) => void
  setBookingComplete: (bookingId: string, pnrCode: string) => void
  reset: () => void
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
  passengers: [],
  bookingId: null,
  pnrCode: null,
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setSearchParams: (params) =>
        set((state) => ({
          searchParams: { ...state.searchParams, ...params },
        })),
      
      setSelectedFlight: (flight) =>
        set({ selectedFlight: flight, selectedSeats: [] }),
      
      addSeat: (seat) =>
        set((state) => ({
          selectedSeats: [...state.selectedSeats, seat],
        })),
      
      removeSeat: (seatId) =>
        set((state) => ({
          selectedSeats: state.selectedSeats.filter((s) => s.id !== seatId),
        })),
      
      clearSeats: () => set({ selectedSeats: [] }),
      
      setPassengers: (passengers) => set({ passengers }),
      
      updatePassenger: (index, data) =>
        set((state) => {
          const updated = [...state.passengers]
          updated[index] = { ...updated[index], ...data }
          return { passengers: updated }
        }),
      
      setBookingComplete: (bookingId, pnrCode) =>
        set({ bookingId, pnrCode }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'booking-storage',
      partialize: (state) => ({
        searchParams: state.searchParams,
        selectedFlight: state.selectedFlight,
        selectedSeats: state.selectedSeats,
        passengers: state.passengers,
      }),
    }
  )
)

// Helper to calculate total price
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

// Generate PNR code
export function generatePNR(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let pnr = ''
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pnr
}
