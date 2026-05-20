'use client'

import { motion } from 'framer-motion'
import { format, differenceInMinutes } from 'date-fns'
import { 
  Plane, 
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Download,
  RefreshCw,
  XCircle,
  FileText,
  Wifi
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { BookingWithDetails } from '@/lib/types'
import { useState } from 'react'

interface BookingsListProps {
  bookings: BookingWithDetails[]
}

export function BookingsList({ bookings }: BookingsListProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  
  const now = new Date()
  const upcomingBookings = bookings.filter(b => new Date(b.flight.departure_time) > now)
  const pastBookings = bookings.filter(b => new Date(b.flight.departure_time) <= now)
  
  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings
  const nextBooking = upcomingBookings[0]

  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="container mx-auto px-4 md:px-10 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 font-sans">My Bookings</h1>
            <p className="text-[#bec7d4] text-sm font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ded1] shadow-[0_0_8px_rgba(0,222,209,0.8)]" />
              Live sync active. Offline ready.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="bg-[#2a2a2a] border-white/10 text-[#e5e2e1] hover:bg-[#3a3939] font-mono"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Manifest
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Next Departure Card */}
            {nextBooking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative rounded-xl p-6 border border-white/5 overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%), rgba(28, 27, 27, 0.6)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Top highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-[#bec7d4] font-mono uppercase tracking-wider">Next Departure</span>
                  <Badge className="bg-[#00ded1]/10 text-[#00ded1] border-[#00ded1]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ded1] mr-1.5 animate-pulse" />
                    On Time
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[#00a3ff] font-mono">{nextBooking.flight.flight_number}</span>
                  <span className="text-[#e5e2e1]">{nextBooking.flight.origin_airport.code}</span>
                  <span className="text-[#bec7d4]">{'→'}</span>
                  <span className="text-[#e5e2e1]">{nextBooking.flight.destination_airport.code}</span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-[#bec7d4] font-mono uppercase mb-1">Departs</p>
                    <p className="text-[#e5e2e1] font-mono">{format(new Date(nextBooking.flight.departure_time), 'HH:mm')} Zulu</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#bec7d4] font-mono uppercase mb-1">Gate</p>
                    <p className="text-[#e5e2e1] font-mono">B-42</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#bec7d4] font-mono uppercase mb-1">Aircraft</p>
                    <p className="text-[#e5e2e1] font-mono">{nextBooking.flight.aircraft.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#bec7d4] font-mono uppercase mb-1">Crew</p>
                    <p className="text-[#e5e2e1] font-mono">Ready</p>
                  </div>
                </div>

                {/* Flight Path Visualization */}
                <div className="relative h-16 rounded-lg bg-[#0e0e0e] border border-white/5 overflow-hidden">
                  <div className="absolute inset-0 flex items-center px-4">
                    <div className="h-2 w-2 rounded-full bg-[#00a3ff]" />
                    <div className="flex-1 mx-4 relative h-px">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00a3ff]/50 to-transparent" style={{ width: '60%' }} />
                      <motion.div
                        initial={{ left: '0%' }}
                        animate={{ left: '60%' }}
                        transition={{ duration: 0 }}
                        className="absolute top-1/2 -translate-y-1/2"
                      >
                        <Plane className="h-4 w-4 text-[#00a3ff] -rotate-90" />
                      </motion.div>
                    </div>
                    <div className="h-2 w-2 rounded-full border border-[#bec7d4]" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Flight Itinerary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative rounded-xl p-6 border border-white/5"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%), rgba(28, 27, 27, 0.6)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#e5e2e1]">Flight Itinerary</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
                      activeTab === 'upcoming' 
                        ? 'bg-[#7000ff] text-white' 
                        : 'text-[#bec7d4] hover:text-[#e5e2e1]'
                    }`}
                  >
                    UPCOMING
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
                      activeTab === 'past' 
                        ? 'bg-[#7000ff] text-white' 
                        : 'text-[#bec7d4] hover:text-[#e5e2e1]'
                    }`}
                  >
                    PAST FLIGHTS
                  </button>
                </div>
              </div>

              {displayBookings.length > 0 ? (
                <div className="space-y-4">
                  {displayBookings.map((booking, index) => {
                    const departureTime = new Date(booking.flight.departure_time)
                    const durationMinutes = differenceInMinutes(
                      new Date(booking.flight.arrival_time),
                      departureTime
                    )
                    const isDelayed = booking.flight.status === 'delayed'
                    
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-[#1c1b1b]/50 border border-white/5 hover:bg-[#2a2a2a]/50 transition-colors"
                      >
                        <div className="h-12 w-12 rounded-lg bg-[#2a2a2a] flex items-center justify-center">
                          <Plane className="h-5 w-5 text-[#bec7d4]" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs text-[#bec7d4] font-mono mb-1">
                            {format(departureTime, 'MMM dd')} • {format(departureTime, 'HH:mm')} Z
                          </div>
                          <div className="font-semibold text-[#e5e2e1]">{booking.flight.flight_number}</div>
                          <div className="text-sm text-[#bec7d4]">
                            {booking.flight.origin_airport.code} {'→'} {booking.flight.destination_airport.code}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {isDelayed ? (
                            <Badge className="bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/20">
                              Delayed 45m
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-[#2a2a2a] border-white/10 text-[#e5e2e1]">
                              Scheduled
                            </Badge>
                          )}
                          <Link 
                            href={`/bookings/${booking.id}/confirmation`}
                            className="text-sm text-[#00a3ff] hover:text-[#00ded1] font-mono flex items-center gap-1 transition-colors"
                          >
                            Details <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Plane className="h-12 w-12 text-[#bec7d4] mx-auto mb-4 opacity-50" />
                  <p className="text-[#bec7d4]">No {activeTab} flights found</p>
                  <Button asChild className="mt-4 bg-[#00a3ff] text-[#003354]">
                    <Link href="/">Book a Flight</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative rounded-xl p-6 border border-white/5"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%), rgba(28, 27, 27, 0.6)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <h3 className="text-lg font-semibold text-[#e5e2e1] mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#1c1b1b]/50 border border-white/5 hover:bg-[#2a2a2a]/50 transition-colors text-left">
                  <RefreshCw className="h-5 w-5 text-[#bec7d4]" />
                  <span className="flex-1 text-sm text-[#e5e2e1]">Reschedule Flight</span>
                  <ArrowRight className="h-4 w-4 text-[#bec7d4]" />
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#1c1b1b]/50 border border-white/5 hover:bg-[#2a2a2a]/50 transition-colors text-left">
                  <XCircle className="h-5 w-5 text-[#bec7d4]" />
                  <span className="flex-1 text-sm text-[#e5e2e1]">Cancel Booking</span>
                  <ArrowRight className="h-4 w-4 text-[#bec7d4]" />
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#1c1b1b]/50 border border-white/5 hover:bg-[#2a2a2a]/50 transition-colors text-left">
                  <FileText className="h-5 w-5 text-[#bec7d4]" />
                  <span className="flex-1 text-sm text-[#e5e2e1]">View Receipt</span>
                  <ArrowRight className="h-4 w-4 text-[#bec7d4]" />
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative rounded-xl p-6 border border-white/5"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%), rgba(28, 27, 27, 0.6)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Button 
                variant="outline" 
                className="w-full bg-[#2a2a2a] border-white/10 text-[#e5e2e1] hover:bg-[#3a3939] font-mono"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Live Tracker
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
