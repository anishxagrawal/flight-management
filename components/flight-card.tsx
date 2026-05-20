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

  // Check if arrival is next day
  const isNextDay = format(arrivalTime, 'yyyy-MM-dd') !== format(departureTime, 'yyyy-MM-dd')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative rounded-xl overflow-hidden border border-white/5"
      style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%), rgba(28, 27, 27, 0.7)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Top highlight line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#00a3ff] to-transparent opacity-50" />
      
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Airline Info */}
          <div className="flex items-center gap-4 lg:w-48">
            <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
              <Plane className="h-5 w-5 text-[#131313]" />
            </div>
            <div>
              <p className="font-semibold text-[#e5e2e1]">{flight.airline.name}</p>
              <p className="text-sm text-[#bec7d4] font-mono">{flight.flight_number}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="lg:hidden flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ded1] shadow-[0_0_8px_rgba(0,222,209,0.8)]" />
            <span className="text-xs text-[#00ded1] font-mono">
              {flight.status === 'scheduled' ? 'On Time' : flight.status}
            </span>
          </div>

          {/* Flight Route */}
          <div className="flex-1 flex items-center gap-4">
            {/* Departure */}
            <div className="text-left">
              <p className="text-3xl font-bold text-[#e5e2e1]">{format(departureTime, 'HH:mm')}</p>
              <p className="text-sm text-[#bec7d4] font-mono">{flight.origin_airport.code} • {flight.origin_airport.name.split(' ')[0]}</p>
            </div>

            {/* Flight Path */}
            <div className="flex-1 flex flex-col items-center gap-1 px-4">
              <div className="text-xs text-[#bec7d4] font-mono">{hours}h {minutes}m</div>
              <div className="w-full flex items-center gap-2">
                <div className="h-2 w-2 rounded-full border-2 border-[#00a3ff] bg-[#131313]" />
                <div className="flex-1 relative h-px bg-[#00a3ff]/20">
                  {/* Animated scan line */}
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '100%', opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-0 left-0 h-full bg-[#00a3ff] shadow-[0_0_8px_rgba(0,163,255,0.8)]"
                  />
                  {/* Plane icon */}
                  <motion.div
                    initial={{ left: 0 }}
                    animate={{ left: '50%' }}
                    transition={{ duration: 0 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <Plane className="h-4 w-4 text-[#00a3ff] rotate-90" />
                  </motion.div>
                </div>
                <div className="h-2 w-2 rounded-full border-2 border-[#bec7d4] bg-[#131313]" />
              </div>
              <Badge variant="outline" className="bg-[#201f1f] border-white/10 text-[#e5e2e1] text-[10px] font-mono">
                Direct
              </Badge>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <p className="text-3xl font-bold text-[#e5e2e1]">
                {format(arrivalTime, 'HH:mm')}
                {isNextDay && <sup className="text-sm text-[#00a3ff] ml-1">+1</sup>}
              </p>
              <p className="text-sm text-[#bec7d4] font-mono">{flight.destination_airport.code} • {flight.destination_airport.name.split(' ')[0]}</p>
            </div>
          </div>

          {/* Price & Select */}
          <div className="flex items-center justify-between lg:flex-col lg:items-end gap-4 lg:w-48 lg:pl-6 lg:border-l lg:border-white/10">
            <div className="hidden lg:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ded1] shadow-[0_0_8px_rgba(0,222,209,0.8)]" />
              <span className="text-xs text-[#00ded1] font-mono">
                {flight.status === 'scheduled' ? 'On Time' : flight.status}
              </span>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-2xl font-bold text-[#00a3ff]">${price.toFixed(0)}</p>
              <p className="text-xs text-[#bec7d4] font-mono">{seatClass === 'first' ? 'First Class' : seatClass === 'business' ? 'Business' : 'Economy'}</p>
            </div>
            <Button 
              className="bg-gradient-to-r from-[#00a3ff] to-[#00629d] text-white font-semibold hover:shadow-[0_0_20px_rgba(0,163,255,0.4)] transition-all font-mono"
              onClick={handleSelect}
              asChild
            >
              <Link href={`/flights/${flight.id}/seats`}>
                Select
              </Link>
            </Button>
          </div>
        </div>

        {/* Expandable Details */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-2 text-sm text-[#bec7d4] hover:text-[#e5e2e1] transition-colors font-mono"
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
            className="mt-4 pt-4 border-t border-white/5"
          >
            <div className="grid md:grid-cols-3 gap-6">
              {/* Route Details */}
              <div>
                <h4 className="text-xs font-semibold mb-3 text-[#bec7d4] font-mono uppercase tracking-wider">Route</h4>
                <div className="space-y-2 text-sm text-[#e5e2e1]">
                  <p>
                    <span className="text-[#bec7d4]">From:</span>{' '}
                    {flight.origin_airport.name}
                  </p>
                  <p>
                    <span className="text-[#bec7d4]">To:</span>{' '}
                    {flight.destination_airport.name}
                  </p>
                  <p>
                    <span className="text-[#bec7d4]">Date:</span>{' '}
                    {format(departureTime, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Aircraft */}
              <div>
                <h4 className="text-xs font-semibold mb-3 text-[#bec7d4] font-mono uppercase tracking-wider">Aircraft</h4>
                <div className="space-y-2 text-sm text-[#e5e2e1]">
                  <p>{flight.aircraft.manufacturer} {flight.aircraft.model}</p>
                  <p className="text-[#bec7d4]">
                    {flight.aircraft.total_seats} seats
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-xs font-semibold mb-3 text-[#bec7d4] font-mono uppercase tracking-wider">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <Badge
                      key={amenity.label}
                      variant="outline"
                      className={amenity.available 
                        ? 'bg-[#00a3ff]/10 border-[#00a3ff]/30 text-[#00a3ff]' 
                        : 'bg-[#2a2a2a] border-white/5 text-[#bec7d4] opacity-50'
                      }
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
    </motion.div>
  )
}
