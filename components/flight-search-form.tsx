'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  ArrowRightLeft, 
  Search,
  MapPin,
  PlaneTakeoff,
  PlaneLanding
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useBookingStore } from '@/lib/booking-store'
import type { Airport, SeatClass } from '@/lib/types'
import { format } from 'date-fns'

export function FlightSearchForm() {
  const router = useRouter()
  const { searchParams, setSearchParams } = useBookingStore()
  const [airports, setAirports] = useState<Airport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [originSearch, setOriginSearch] = useState('')
  const [destinationSearch, setDestinationSearch] = useState('')
  const [showOriginDropdown, setShowOriginDropdown] = useState(false)
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)

  useEffect(() => {
    async function fetchAirports() {
      const supabase = createClient()
      const { data } = await supabase
        .from('airports')
        .select('*')
        .order('city')
      if (data) setAirports(data)
    }
    fetchAirports()
  }, [])

  const filteredOriginAirports = airports.filter(
    (a) =>
      a.city.toLowerCase().includes(originSearch.toLowerCase()) ||
      a.code.toLowerCase().includes(originSearch.toLowerCase()) ||
      a.name.toLowerCase().includes(originSearch.toLowerCase())
  )

  const filteredDestinationAirports = airports.filter(
    (a) =>
      a.city.toLowerCase().includes(destinationSearch.toLowerCase()) ||
      a.code.toLowerCase().includes(destinationSearch.toLowerCase()) ||
      a.name.toLowerCase().includes(destinationSearch.toLowerCase())
  )

  const selectedOrigin = airports.find((a) => a.id === searchParams.origin)
  const selectedDestination = airports.find((a) => a.id === searchParams.destination)

  const handleSwapLocations = () => {
    const temp = searchParams.origin
    setSearchParams({
      origin: searchParams.destination,
      destination: temp,
    })
    const tempSearch = originSearch
    setOriginSearch(destinationSearch)
    setDestinationSearch(tempSearch)
  }

  const handleSearch = () => {
    if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
      return
    }
    setIsLoading(true)
    const params = new URLSearchParams({
      origin: searchParams.origin,
      destination: searchParams.destination,
      date: searchParams.departureDate,
      passengers: searchParams.passengers.toString(),
      class: searchParams.seatClass,
    })
    router.push(`/flights?${params.toString()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative w-full"
    >
      {/* Glassmorphism card */}
      <div 
        className="relative rounded-2xl p-6 md:p-8 border border-white/5"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%), rgba(28, 27, 27, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(0, 163, 255, 0.05)',
        }}
      >
        {/* Top highlight line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="grid gap-6">
          {/* Origin and Destination */}
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            {/* Origin */}
            <div className="relative">
              <Label className="text-xs text-[#bec7d4] mb-2 block font-mono tracking-wider uppercase">Origin</Label>
              <div className="relative">
                <PlaneTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bec7d4]" />
                <Input
                  placeholder="City or airport"
                  value={selectedOrigin ? `${selectedOrigin.code}` : originSearch}
                  onChange={(e) => {
                    setOriginSearch(e.target.value)
                    setSearchParams({ origin: '' })
                    setShowOriginDropdown(true)
                  }}
                  onFocus={() => setShowOriginDropdown(true)}
                  onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                  className="pl-10 bg-[#121212] border-white/5 border-b-white/10 h-12 text-[#e5e2e1] placeholder:text-[#bec7d4]/50 focus:border-[#00a3ff] focus:border-b-[#00a3ff] transition-all"
                />
                {showOriginDropdown && filteredOriginAirports.length > 0 && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50 max-h-60 overflow-y-auto border border-white/5"
                    style={{
                      background: 'rgba(28, 27, 27, 0.95)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    {filteredOriginAirports.map((airport) => (
                      <button
                        key={airport.id}
                        className="w-full px-4 py-3 text-left hover:bg-[#00a3ff]/10 transition-colors flex items-center gap-3"
                        onMouseDown={() => {
                          setSearchParams({ origin: airport.id })
                          setOriginSearch(`${airport.city} (${airport.code})`)
                          setShowOriginDropdown(false)
                        }}
                      >
                        <div className="h-8 w-8 rounded-full bg-[#00a3ff]/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#00a3ff] font-mono">{airport.code}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#e5e2e1]">{airport.city}</p>
                          <p className="text-xs text-[#bec7d4]">{airport.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSwapLocations}
              className="h-12 w-12 rounded-full bg-[#2a2a2a] border border-white/10 flex items-center justify-center hover:bg-[#3a3939] transition-colors self-end mb-0"
              aria-label="Swap locations"
            >
              <ArrowRightLeft className="h-4 w-4 text-[#bec7d4]" />
            </motion.button>

            {/* Destination */}
            <div className="relative">
              <Label className="text-xs text-[#bec7d4] mb-2 block font-mono tracking-wider uppercase">Destination</Label>
              <div className="relative">
                <PlaneLanding className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bec7d4]" />
                <Input
                  placeholder="City or airport"
                  value={selectedDestination ? `${selectedDestination.code}` : destinationSearch}
                  onChange={(e) => {
                    setDestinationSearch(e.target.value)
                    setSearchParams({ destination: '' })
                    setShowDestinationDropdown(true)
                  }}
                  onFocus={() => setShowDestinationDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
                  className="pl-10 bg-[#121212] border-white/5 border-b-white/10 h-12 text-[#e5e2e1] placeholder:text-[#bec7d4]/50 focus:border-[#00a3ff] focus:border-b-[#00a3ff] transition-all"
                />
                {showDestinationDropdown && filteredDestinationAirports.length > 0 && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50 max-h-60 overflow-y-auto border border-white/5"
                    style={{
                      background: 'rgba(28, 27, 27, 0.95)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    {filteredDestinationAirports.map((airport) => (
                      <button
                        key={airport.id}
                        className="w-full px-4 py-3 text-left hover:bg-[#00a3ff]/10 transition-colors flex items-center gap-3"
                        onMouseDown={() => {
                          setSearchParams({ destination: airport.id })
                          setDestinationSearch(`${airport.city} (${airport.code})`)
                          setShowDestinationDropdown(false)
                        }}
                      >
                        <div className="h-8 w-8 rounded-full bg-[#00a3ff]/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#00a3ff] font-mono">{airport.code}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#e5e2e1]">{airport.city}</p>
                          <p className="text-xs text-[#bec7d4]">{airport.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date and Search Button Row */}
          <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            {/* Departure Date */}
            <div>
              <Label className="text-xs text-[#bec7d4] mb-2 block font-mono tracking-wider uppercase">Departure</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bec7d4]" />
                <Input
                  type="date"
                  value={searchParams.departureDate}
                  onChange={(e) => setSearchParams({ departureDate: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="pl-10 bg-[#121212] border-white/5 border-b-white/10 h-12 text-[#e5e2e1] focus:border-[#00a3ff] focus:border-b-[#00a3ff] transition-all"
                />
              </div>
            </div>

            {/* Return Date */}
            <div>
              <Label className="text-xs text-[#bec7d4] mb-2 block font-mono tracking-wider uppercase">Return</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bec7d4]" />
                <Input
                  type="date"
                  value={searchParams.returnDate}
                  onChange={(e) => setSearchParams({ returnDate: e.target.value })}
                  min={searchParams.departureDate || format(new Date(), 'yyyy-MM-dd')}
                  className="pl-10 bg-[#121212] border-white/5 border-b-white/10 h-12 text-[#e5e2e1] focus:border-[#00a3ff] focus:border-b-[#00a3ff] transition-all"
                />
              </div>
            </div>

            {/* Search Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleSearch}
                disabled={!searchParams.origin || !searchParams.destination || !searchParams.departureDate || isLoading}
                className="h-12 px-8 bg-gradient-to-r from-[#00a3ff] to-[#00ded1] text-[#003354] font-semibold gap-2 hover:shadow-[0_0_20px_rgba(0,163,255,0.4)] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-[#003354]/30 border-t-[#003354] rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Clearance
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
