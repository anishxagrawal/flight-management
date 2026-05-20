'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format, differenceInMinutes } from 'date-fns'
import { 
  Plane, 
  CheckCircle, 
  Calendar,
  Clock,
  MapPin,
  Users,
  Download,
  Mail,
  Share2,
  ArrowRight,
  Copy,
  QrCode
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBookingStore } from '@/lib/booking-store'
import type { BookingWithDetails } from '@/lib/types'
import { useState } from 'react'

interface ConfirmationPageProps {
  booking: BookingWithDetails
}

export function ConfirmationPage({ booking }: ConfirmationPageProps) {
  const { reset } = useBookingStore()
  const [copied, setCopied] = useState(false)
  
  // Clear the booking store after successful booking
  useEffect(() => {
    reset()
  }, [reset])
  
  const flight = booking.flight
  const departureTime = new Date(flight.departure_time)
  const arrivalTime = new Date(flight.arrival_time)
  const durationMinutes = differenceInMinutes(arrivalTime, departureTime)
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  
  const copyPNR = () => {
    navigator.clipboard.writeText(booking.pnr_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="relative w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
              </div>
            </motion.div>
            
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your flight has been successfully booked. Check your email for confirmation.
            </p>
          </motion.div>

          {/* PNR Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6 mb-6 text-center"
          >
            <p className="text-sm text-muted-foreground mb-2">Booking Reference (PNR)</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl font-mono font-bold tracking-wider text-primary">
                {booking.pnr_code}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={copyPNR}
                className="shrink-0"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use this code to manage your booking
            </p>
          </motion.div>

          {/* Flight Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl overflow-hidden mb-6"
          >
            {/* Airline Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{flight.airline.code}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{flight.airline.name}</p>
                    <p className="text-muted-foreground">{flight.flight_number}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-primary border-primary">
                  {booking.status}
                </Badge>
              </div>
            </div>

            {/* Route */}
            <div className="p-6">
              <div className="flex items-center gap-6">
                {/* Departure */}
                <div className="flex-1">
                  <p className="text-3xl font-bold">{format(departureTime, 'HH:mm')}</p>
                  <p className="font-semibold text-lg">{flight.origin_airport.code}</p>
                  <p className="text-sm text-muted-foreground">{flight.origin_airport.city}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {flight.origin_airport.name}
                  </p>
                </div>

                {/* Flight Path */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="w-24 h-px bg-border relative">
                      <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-1/2 -translate-y-1/2"
                      >
                        <Plane className="h-4 w-4 text-primary -rotate-90" />
                      </motion.div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-accent" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {hours}h {minutes}m • Direct
                  </p>
                </div>

                {/* Arrival */}
                <div className="flex-1 text-right">
                  <p className="text-3xl font-bold">{format(arrivalTime, 'HH:mm')}</p>
                  <p className="font-semibold text-lg">{flight.destination_airport.code}</p>
                  <p className="text-sm text-muted-foreground">{flight.destination_airport.city}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {flight.destination_airport.name}
                  </p>
                </div>
              </div>

              {/* Date & Aircraft */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-border text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(departureTime, 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Plane className="h-4 w-4" />
                  {flight.aircraft.manufacturer} {flight.aircraft.model}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Passengers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Passengers
            </h3>
            <div className="space-y-3">
              {booking.passengers.map((passenger, index) => (
                <div
                  key={passenger.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-semibold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {passenger.first_name} {passenger.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{passenger.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      Seat {passenger.seat?.seat_number || 'N/A'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {passenger.seat?.seat_class || 'Economy'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Price Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total Paid</span>
              <span className="text-3xl font-bold text-primary">${Number(booking.total_price).toFixed(2)}</span>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="outline" size="lg" className="gap-2">
              <Download className="h-4 w-4" />
              Download Ticket
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Mail className="h-4 w-4" />
              Email Confirmation
            </Button>
            <Button size="lg" className="gap-2 bg-primary" asChild>
              <Link href="/bookings">
                View All Bookings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Important Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center text-sm text-muted-foreground"
          >
            <p className="mb-2">
              Please arrive at the airport at least 2 hours before departure for domestic flights
              and 3 hours for international flights.
            </p>
            <p>
              Don&apos;t forget to bring a valid ID and your booking confirmation.
            </p>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
