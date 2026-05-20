'use client'

import { motion } from 'framer-motion'
import { format, differenceInMinutes } from 'date-fns'
import { 
  Plane, 
  Clock, 
  ArrowRight, 
  Wifi, 
  Utensils, 
  Tv,
  Luggage,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import type { FlightWithDetails, SeatClass } from '@/lib/types'
import Link from 'next/link'
import { useBookingStore } from '@/lib/booking-store'

interface FlightCardProps {
  flight: FlightWithDetails
  seatClass: SeatClass
}

export function FlightCard({ flight, seatClass }: FlightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { setSelectedFlight } = useBookingStore()
  
  const departureTime = new Date(flight.departure_time)
  const arrivalTime = new Date(flight.arrival_time)
  const durationMinutes = differenceInMinutes(arrivalTime, departureTime)
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60

  const price = seatClass === 'first' 
    ? (flight.first_class_price || flight.base_price * 3)
    : seatClass === 'business'
      ? (flight.business_price || flight.base_price * 2)
      : flight.base_price

  const amenities = [
    { icon: Wifi, label: 'Wi-Fi', available: true },
    { icon: Utensils, label: 'Meals', available: seatClass !== 'economy' },
    { icon: Tv, label: 'Entertainment', available: true },
    { icon: Luggage, label: 'Luggage', available: true },
  ]

  const handleSelect = () => {
    setSelectedFlight(flight)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Airline Info */}
          <div className="flex items-center gap-4 lg:w-48">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{flight.airline.code}</span>
            </div>
            <div>
              <p className="font-semibold">{flight.airline.name}</p>
              <p className="text-sm text-muted-foreground">{flight.flight_number}</p>
            </div>
          </div>

          {/* Flight Route */}
          <div className="flex-1 flex items-center gap-4">
            {/* Departure */}
            <div className="text-center lg:text-left">
              <p className="text-2xl font-bold">{format(departureTime, 'HH:mm')}</p>
              <p className="text-sm text-muted-foreground">{flight.origin_airport.code}</p>
            </div>

            {/* Flight Path */}
            <div className="flex-1 flex items-center gap-2 px-4">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="flex-1 relative">
                <div className="h-px bg-border" />
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

            {/* Arrival */}
            <div className="text-center lg:text-right">
              <p className="text-2xl font-bold">{format(arrivalTime, 'HH:mm')}</p>
              <p className="text-sm text-muted-foreground">{flight.destination_airport.code}</p>
            </div>
          </div>

          {/* Duration & Price */}
          <div className="flex items-center justify-between lg:flex-col lg:items-end gap-2 lg:w-48">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{hours}h {minutes}m</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">${price.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">per person</p>
            </div>
          </div>

          {/* Select Button */}
          <div className="lg:ml-4">
            <Button 
              className="w-full lg:w-auto bg-primary hover:bg-primary/90"
              onClick={handleSelect}
              asChild
            >
              <Link href={`/flights/${flight.id}/seats`}>
                Select
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Expandable Details */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Flight details
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.button>

        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-border"
          >
            <div className="grid md:grid-cols-3 gap-6">
              {/* Route Details */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Route</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">From:</span>{' '}
                    {flight.origin_airport.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">To:</span>{' '}
                    {flight.destination_airport.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Date:</span>{' '}
                    {format(departureTime, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Aircraft */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Aircraft</h4>
                <div className="space-y-2 text-sm">
                  <p>{flight.aircraft.manufacturer} {flight.aircraft.model}</p>
                  <p className="text-muted-foreground">
                    {flight.aircraft.total_seats} seats
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <Badge
                      key={amenity.label}
                      variant={amenity.available ? 'default' : 'secondary'}
                      className={amenity.available ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'opacity-50'}
                    >
                      <amenity.icon className="h-3 w-3 mr-1" />
                      {amenity.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-6 py-3 bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge 
            variant="outline" 
            className={`
              ${flight.status === 'scheduled' ? 'border-primary/50 text-primary' : ''}
              ${flight.status === 'delayed' ? 'border-yellow-500/50 text-yellow-500' : ''}
              ${flight.status === 'cancelled' ? 'border-destructive/50 text-destructive' : ''}
            `}
          >
            {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {seatClass === 'first' ? 'First Class' : seatClass === 'business' ? 'Business' : 'Economy'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Direct flight
        </span>
      </div>
    </motion.div>
  )
}
