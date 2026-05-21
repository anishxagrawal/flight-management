'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { format, differenceInMinutes } from 'date-fns'
import { toast } from 'sonner'
import { 
  Plane, 
  User, 
  Mail, 
  Phone,
  CreditCard,
  ArrowRight,
  Check,
  Clock,
  Shield,
  FileText
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore, calculateTotalPrice, generatePNR } from '@/lib/stores/flight-store'
import type { FlightWithDetails, Profile, Passenger } from '@/lib/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface BookingPageProps {
  flight: FlightWithDetails
  user: SupabaseUser
  profile: Profile | null
}

export function BookingPage({ flight, user, profile }: BookingPageProps) {
  const router = useRouter()
  const { selectedSeats, searchParams, setBookingComplete, reset } = useFlightStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  
  const seatClass = searchParams.seatClass || 'economy'
  const passengers = searchParams.passengers || 1
  
  // Initialize passenger forms
  const [passengerForms, setPassengerForms] = useState<Partial<Passenger>[]>(
    selectedSeats.map((seat, index) => ({
      first_name: index === 0 ? profile?.full_name?.split(' ')[0] || '' : '',
      last_name: index === 0 ? profile?.full_name?.split(' ').slice(1).join(' ') || '' : '',
      email: index === 0 ? user.email || '' : '',
      phone: index === 0 ? profile?.phone || '' : '',
      passport_number: '',
      nationality: '',
      date_of_birth: '',
      is_primary: index === 0,
      seat_id: seat.id,
    }))
  )
  
  const departureTime = new Date(flight.departure_time)
  const arrivalTime = new Date(flight.arrival_time)
  const durationMinutes = differenceInMinutes(arrivalTime, departureTime)
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  
  const totalPrice = calculateTotalPrice(flight, selectedSeats, seatClass)
  
  const updatePassenger = (index: number, field: string, value: string) => {
    setPassengerForms(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }
  
  const isFormValid = () => {
    return passengerForms.every(p => 
      p.first_name && 
      p.last_name && 
      p.email
    ) && agreeToTerms
  }
  
  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError('Please fill in all required fields and agree to the terms')
      toast.error('Please fill in all required fields and agree to the terms')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const pnrCode = generatePNR()
      
      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          flight_id: flight.id,
          pnr_code: pnrCode,
          status: 'confirmed',
          total_price: totalPrice,
        })
        .select()
        .single()
      
      if (bookingError) throw bookingError
      
      // Create passengers
      const passengerData = passengerForms.map(p => ({
        booking_id: booking.id,
        seat_id: p.seat_id,
        first_name: p.first_name!,
        last_name: p.last_name!,
        email: p.email || null,
        phone: p.phone || null,
        passport_number: p.passport_number || null,
        nationality: p.nationality || null,
        date_of_birth: p.date_of_birth || null,
        is_primary: p.is_primary || false,
      }))
      
      const { error: passengerError } = await supabase
        .from('passengers')
        .insert(passengerData)
      
      if (passengerError) throw passengerError
      
      // Update seat status to occupied
      const { error: seatError } = await supabase
        .from('seats')
        .update({ status: 'occupied' })
        .in('id', selectedSeats.map(s => s.id))
      
      if (seatError) throw seatError
      
      // Success toast
      toast.success('Booking confirmed! 🎉')
      
      // Store booking info and redirect
      setBookingComplete(booking.id, pnrCode)
      router.push(`/bookings/${booking.id}/confirmation`)
      
    } catch (err) {
      console.error('Booking error:', err)
      const message = err instanceof Error ? err.message : 'Failed to complete booking'
      toast.error(message)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (selectedSeats.length === 0) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-24 pb-12 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">No seats selected</h1>
          <p className="text-muted-foreground mb-6">Please go back and select your seats first</p>
          <Button onClick={() => router.push(`/flights/${flight.id}/seats`)}>
            Select Seats
          </Button>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-12"
          >
            {['Select Flight', 'Choose Seats', 'Passenger Details', 'Confirmation'].map((step, index) => (
              <div key={step} className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${index <= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    index < 2 ? 'bg-primary text-primary-foreground' : 
                    index === 2 ? 'bg-primary/20 text-primary border-2 border-primary' : 
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {index < 2 ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{step}</span>
                </div>
                {index < 3 && <div className={`w-8 h-px ${index < 2 ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Main Content - Passenger Forms */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl font-bold mb-2">Passenger Details</h1>
                <p className="text-muted-foreground mb-8">
                  Enter information for all {passengers} {passengers === 1 ? 'passenger' : 'passengers'}
                </p>

                <div className="space-y-6">
                  {passengerForms.map((passenger, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Passenger {index + 1}</h3>
                            <p className="text-sm text-muted-foreground">
                              Seat {selectedSeats[index]?.seat_number} • {selectedSeats[index]?.seat_class}
                            </p>
                          </div>
                        </div>
                        {passenger.is_primary && (
                          <Badge variant="outline" className="text-primary border-primary">
                            Primary Contact
                          </Badge>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`firstName-${index}`}>First Name *</Label>
                          <Input
                            id={`firstName-${index}`}
                            value={passenger.first_name || ''}
                            onChange={(e) => updatePassenger(index, 'first_name', e.target.value)}
                            placeholder="John"
                            className="bg-secondary/50 border-border/50"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`lastName-${index}`}>Last Name *</Label>
                          <Input
                            id={`lastName-${index}`}
                            value={passenger.last_name || ''}
                            onChange={(e) => updatePassenger(index, 'last_name', e.target.value)}
                            placeholder="Doe"
                            className="bg-secondary/50 border-border/50"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`email-${index}`}>Email *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id={`email-${index}`}
                              type="email"
                              value={passenger.email || ''}
                              onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                              placeholder="john@example.com"
                              className="pl-10 bg-secondary/50 border-border/50"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`phone-${index}`}>Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id={`phone-${index}`}
                              type="tel"
                              value={passenger.phone || ''}
                              onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                              placeholder="+1 234 567 8900"
                              className="pl-10 bg-secondary/50 border-border/50"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`passport-${index}`}>Passport Number</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id={`passport-${index}`}
                              value={passenger.passport_number || ''}
                              onChange={(e) => updatePassenger(index, 'passport_number', e.target.value)}
                              placeholder="AB1234567"
                              className="pl-10 bg-secondary/50 border-border/50"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`nationality-${index}`}>Nationality</Label>
                          <Input
                            id={`nationality-${index}`}
                            value={passenger.nationality || ''}
                            onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                            placeholder="United States"
                            className="bg-secondary/50 border-border/50"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Terms and Conditions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                      I agree to the{' '}
                      <a href="#" className="text-primary hover:underline">Terms and Conditions</a>,{' '}
                      <a href="#" className="text-primary hover:underline">Privacy Policy</a>, and{' '}
                      <a href="#" className="text-primary hover:underline">Fare Rules</a>.
                      I confirm that all passenger information is accurate.
                    </label>
                  </div>
                </motion.div>
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
                <h3 className="text-lg font-semibold mb-4">Flight Summary</h3>

                {/* Flight Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="font-bold text-primary">{flight.airline.code}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{flight.airline.name}</p>
                    <p className="text-sm text-muted-foreground">{flight.flight_number}</p>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-4 mb-4 p-4 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-bold">{flight.origin_airport.code}</p>
                    <p className="text-xs text-muted-foreground">{format(departureTime, 'HH:mm')}</p>
                  </div>
                  <div className="flex-1 flex items-center">
                    <div className="h-px flex-1 bg-border" />
                    <Plane className="h-4 w-4 mx-2 text-primary -rotate-90" />
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{flight.destination_airport.code}</p>
                    <p className="text-xs text-muted-foreground">{format(arrivalTime, 'HH:mm')}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>{format(departureTime, 'EEE, MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{hours}h {minutes}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Class</span>
                    <span className="capitalize">{seatClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passengers</span>
                    <span>{passengers}</span>
                  </div>
                </div>

                {/* Seats */}
                <div className="border-t border-border pt-4 mb-4">
                  <p className="text-sm font-medium mb-2">Selected Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map(seat => (
                      <Badge key={seat.id} variant="secondary">
                        {seat.seat_number}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total Price</span>
                    <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isLoading}
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Confirm Booking
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Secure payment processing</span>
                  </div>
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
