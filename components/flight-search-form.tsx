'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Plane, 
  Calendar, 
  Users, 
  ArrowRightLeft, 
  Search,
  MapPin
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore } from '@/lib/stores/flight-store'
import type { Airport, SeatClass } from '@/lib/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function FlightSearchForm() {
  const router = useRouter()
  const { searchParams, setSearchParams } = useFlightStore()
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
      transition={{ delay: 0.2 }}
      className="glass-card p-6 md:p-8 rounded-2xl w-full max-w-4xl mx-auto"
    >
      <div className="grid gap-6">
        {/* Origin and Destination */}
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          {/* Origin */}
          <div className="relative">
            <Label className="text-xs text-muted-foreground mb-2 block">From</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="City or airport"
                value={selectedOrigin ? `${selectedOrigin.city} (${selectedOrigin.code})` : originSearch}
                onChange={(e) => {
                  setOriginSearch(e.target.value)
                  setSearchParams({ origin: '' })
                  setShowOriginDropdown(true)
                }}
                onFocus={() => setShowOriginDropdown(true)}
                onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                className="pl-10 bg-secondary/50 border-border/50 h-12"
              />
              {showOriginDropdown && filteredOriginAirports.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-card rounded-lg overflow-hidden z-50 max-h-60 overflow-y-auto">
                  {filteredOriginAirports.map((airport) => (
                    <button
                      key={airport.id}
                      className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-3"
                      onMouseDown={() => {
                        setSearchParams({ origin: airport.id })
                        setOriginSearch(`${airport.city} (${airport.code})`)
                        setShowOriginDropdown(false)
                      }}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{airport.code}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{airport.city}</p>
                        <p className="text-xs text-muted-foreground">{airport.name}</p>
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
            className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors self-end mb-0"
            aria-label="Swap locations"
          >
            <ArrowRightLeft className="h-4 w-4 text-primary" />
          </motion.button>

          {/* Destination */}
          <div className="relative">
            <Label className="text-xs text-muted-foreground mb-2 block">To</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="City or airport"
                value={selectedDestination ? `${selectedDestination.city} (${selectedDestination.code})` : destinationSearch}
                onChange={(e) => {
                  setDestinationSearch(e.target.value)
                  setSearchParams({ destination: '' })
                  setShowDestinationDropdown(true)
                }}
                onFocus={() => setShowDestinationDropdown(true)}
                onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
                className="pl-10 bg-secondary/50 border-border/50 h-12"
              />
              {showDestinationDropdown && filteredDestinationAirports.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-card rounded-lg overflow-hidden z-50 max-h-60 overflow-y-auto">
                  {filteredDestinationAirports.map((airport) => (
                    <button
                      key={airport.id}
                      className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-3"
                      onMouseDown={() => {
                        setSearchParams({ destination: airport.id })
                        setDestinationSearch(`${airport.city} (${airport.code})`)
                        setShowDestinationDropdown(false)
                      }}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{airport.code}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{airport.city}</p>
                        <p className="text-xs text-muted-foreground">{airport.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date, Passengers, Class */}
        <div className="grid md:grid-cols-4 gap-4">
          {/* Departure Date */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Departure</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={searchParams.departureDate}
                onChange={(e) => setSearchParams({ departureDate: e.target.value })}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="pl-10 bg-secondary/50 border-border/50 h-12"
              />
            </div>
          </div>

          {/* Return Date */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Return (Optional)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={searchParams.returnDate}
                onChange={(e) => setSearchParams({ returnDate: e.target.value })}
                min={searchParams.departureDate || format(new Date(), 'yyyy-MM-dd')}
                className="pl-10 bg-secondary/50 border-border/50 h-12"
              />
            </div>
          </div>

          {/* Passengers */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Passengers</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Select
                value={searchParams.passengers.toString()}
                onValueChange={(v) => setSearchParams({ passengers: parseInt(v) })}
              >
                <SelectTrigger className="pl-10 bg-secondary/50 border-border/50 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} {n === 1 ? 'Passenger' : 'Passengers'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Class */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Class</Label>
            <Select
              value={searchParams.seatClass}
              onValueChange={(v) => setSearchParams({ seatClass: v as SeatClass })}
            >
              <SelectTrigger className="bg-secondary/50 border-border/50 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="first">First Class</SelectItem>
              </SelectContent>
            </Select>
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
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg gap-2"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Search className="h-5 w-5" />
                Search Flights
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
