'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { format, differenceInMinutes } from 'date-fns'
import { 
  Plane, 
  ArrowRight, 
  Clock, 
  Users,
  Check,
  AlertCircle
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SeatMap } from '@/components/seat-map'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBookingStore, calculateTotalPrice } from '@/lib/booking-store'
import type { FlightWithDetails, Seat, SeatClass } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

interface SeatSelectionPageProps {
  flight: FlightWithDetails
  initialSeats: Seat[]
  user: User | null
}

export function SeatSelectionPage({ flight, initialSeats, user }: SeatSelectionPageProps) {
  const router = useRouter()
  const { 
    selectedSeats, 
    searchParams, 
    setSelectedFlight,
    clearSeats
  } = useBookingStore()
  
  const [isLoading, setIsLoading] = useState(false)
  
  const seatClass = searchParams.seatClass || 'economy'
  const passengers = searchParams.passengers || 1
  
  // Set selected flight on mount
  useEffect(() => {
    setSelectedFlight(flight)
  }, [flight, setSelectedFlight])
  
  const departureTime = new Date(flight.departure_time)
  const arrivalTime = new Date(flight.arrival_time)
  const durationMinutes = differenceInMinutes(arrivalTime, departureTime)
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  
  const totalPrice = calculateTotalPrice(flight, selectedSeats, seatClass)
  
  const canProceed = selectedSeats.length === passengers
  
  const handleContinue = () => {
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent(`/flights/${flight.id}/seats`))
      return
    }
    
    if (!canProceed) {
      return
    }
    
    setIsLoading(true)
    router.push(`/flights/${flight.id}/booking`)
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Main Content */}
            <div>
              {/* Flight Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 mb-8"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Airline */}
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{flight.airline.code}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{flight.airline.name}</p>
                      <p className="text-sm text-muted-foreground">{flight.flight_number}</p>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{format(departureTime, 'HH:mm')}</p>
                      <p className="text-sm text-muted-foreground">{flight.origin_airport.code}</p>
                      <p className="text-xs text-muted-foreground">{flight.origin_airport.city}</p>
                    </div>

                    <div className="flex-1 flex items-center gap-2 px-4">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1 relative">
                        <div className="h-px bg-border" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2">
                          <Plane className="h-4 w-4 text-primary -rotate-90" />
                        </div>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-accent" />
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold">{format(arrivalTime, 'HH:mm')}</p>
                      <p className="text-sm text-muted-foreground">{flight.destination_airport.code}</p>
                      <p className="text-xs text-muted-foreground">{flight.destination_airport.city}</p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{hours}h {minutes}m</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-4 text-sm">
                  <span>{format(departureTime, 'EEEE, MMMM d, yyyy')}</span>
                  <Badge variant="outline" className="capitalize">{seatClass}</Badge>
                  <span className="text-muted-foreground">
                    {flight.aircraft.manufacturer} {flight.aircraft.model}
                  </span>
                </div>
              </motion.div>

              {/* Seat Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Select Your Seats</h2>
                    <p className="text-muted-foreground">
                      Choose {passengers} {passengers === 1 ? 'seat' : 'seats'} for your journey
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{selectedSeats.length}/{passengers}</span>
                  </div>
                </div>

                <SeatMap
                  flightId={flight.id}
                  initialSeats={initialSeats}
                  passengerCount={passengers}
                  seatClass={seatClass}
                />
              </motion.div>
            </div>

            {/* Sidebar - Booking Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

                {/* Selected Seats */}
                <div className="space-y-3 mb-6">
                  {selectedSeats.length > 0 ? (
                    selectedSeats.map((seat, index) => (
                      <motion.div
                        key={seat.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg seat-selected flex items-center justify-center">
                            <Check className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Seat {seat.seat_number}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {seat.seat_class} • {seat.is_window ? 'Window' : seat.is_aisle ? 'Aisle' : 'Middle'}
                            </p>
                          </div>
                        </div>
                        {Number(seat.price_modifier) > 0 && (
                          <span className="text-sm text-primary">+${seat.price_modifier}</span>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No seats selected yet</p>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base fare ({selectedSeats.length} × {seatClass})</span>
                    <span>
                      ${selectedSeats.length > 0 
                        ? (seatClass === 'first' 
                            ? (flight.first_class_price || flight.base_price * 3) * selectedSeats.length
                            : seatClass === 'business'
                              ? (flight.business_price || flight.base_price * 2) * selectedSeats.length
                              : flight.base_price * selectedSeats.length
                          ).toFixed(2)
                        : '0.00'
                      }
                    </span>
                  </div>
                  {selectedSeats.some(s => Number(s.price_modifier) > 0) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seat upgrades</span>
                      <span>
                        +${selectedSeats.reduce((sum, s) => sum + Number(s.price_modifier), 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={handleContinue}
                    disabled={!canProceed || isLoading}
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : !user ? (
                      <>
                        Sign in to continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : canProceed ? (
                      <>
                        Continue to Booking
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      `Select ${passengers - selectedSeats.length} more seat${passengers - selectedSeats.length > 1 ? 's' : ''}`
                    )}
                  </Button>

                  {!user && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      <Link href="/auth/sign-up" className="text-primary hover:underline">
                        Create an account
                      </Link>
                      {' '}to save your booking
                    </p>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSeats}
                    className="w-full mt-2 text-muted-foreground"
                  >
                    Clear selection
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
