'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Plane, 
  Filter, 
  SortAsc, 
  SortDesc,
  Clock,
  DollarSign,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FlightCard } from '@/components/flight-card'
import type { FlightWithDetails, Airport, SeatClass } from '@/lib/types'

interface FlightResultsProps {
  initialFlights: FlightWithDetails[]
  airports: Airport[]
  searchParams: {
    origin?: string
    destination?: string
    date?: string
    passengers?: string
    class?: string
  }
}

type SortOption = 'price-asc' | 'price-desc' | 'duration-asc' | 'departure-asc'

export function FlightResults({ initialFlights, airports, searchParams }: FlightResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('price-asc')
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  
  const seatClass = (searchParams.class as SeatClass) || 'economy'
  const passengers = parseInt(searchParams.passengers || '1')

  const originAirport = airports.find(a => a.id === searchParams.origin)
  const destinationAirport = airports.find(a => a.id === searchParams.destination)

  // Get unique airlines from flights
  const airlines = useMemo(() => {
    const uniqueAirlines = new Map()
    initialFlights.forEach(f => {
      if (f.airline) {
        uniqueAirlines.set(f.airline.id, f.airline)
      }
    })
    return Array.from(uniqueAirlines.values())
  }, [initialFlights])

  // Filter and sort flights
  const filteredFlights = useMemo(() => {
    let result = [...initialFlights]
    
    // Filter by airline
    if (selectedAirlines.length > 0) {
      result = result.filter(f => selectedAirlines.includes(f.airline_id))
    }
    
    // Sort
    result.sort((a, b) => {
      const getPrice = (f: FlightWithDetails) => 
        seatClass === 'first' ? (f.first_class_price || f.base_price * 3) :
        seatClass === 'business' ? (f.business_price || f.base_price * 2) : f.base_price
      
      const getDuration = (f: FlightWithDetails) => 
        new Date(f.arrival_time).getTime() - new Date(f.departure_time).getTime()
      
      switch (sortBy) {
        case 'price-asc':
          return getPrice(a) - getPrice(b)
        case 'price-desc':
          return getPrice(b) - getPrice(a)
        case 'duration-asc':
          return getDuration(a) - getDuration(b)
        case 'departure-asc':
          return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
        default:
          return 0
      }
    })
    
    return result
  }, [initialFlights, selectedAirlines, sortBy, seatClass])

  const toggleAirline = (airlineId: string) => {
    setSelectedAirlines(prev => 
      prev.includes(airlineId) 
        ? prev.filter(id => id !== airlineId)
        : [...prev, airlineId]
    )
  }

  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {originAirport && destinationAirport ? (
                  <>
                    {originAirport.city} <span className="text-primary">→</span> {destinationAirport.city}
                  </>
                ) : (
                  'Available Flights'
                )}
              </h1>
              <p className="text-muted-foreground">
                {filteredFlights.length} {filteredFlights.length === 1 ? 'flight' : 'flights'} found
                {searchParams.date && ` • ${new Date(searchParams.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
                {` • ${passengers} ${passengers === 1 ? 'passenger' : 'passengers'}`}
                {` • ${seatClass === 'first' ? 'First Class' : seatClass === 'business' ? 'Business' : 'Economy'}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {selectedAirlines.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedAirlines.length}
                  </Badge>
                )}
              </Button>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="price-asc">
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Price: Low to High
                    </span>
                  </SelectItem>
                  <SelectItem value="price-desc">
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Price: High to Low
                    </span>
                  </SelectItem>
                  <SelectItem value="duration-asc">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Duration: Shortest
                    </span>
                  </SelectItem>
                  <SelectItem value="departure-asc">
                    <span className="flex items-center gap-2">
                      <Plane className="h-4 w-4" />
                      Departure: Earliest
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="glass-card rounded-xl p-4 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filter by Airline</h3>
                {selectedAirlines.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAirlines([])}
                    className="text-muted-foreground"
                  >
                    Clear all
                    <X className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {airlines.map((airline) => (
                  <Button
                    key={airline.id}
                    variant={selectedAirlines.includes(airline.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleAirline(airline.id)}
                    className={selectedAirlines.includes(airline.id) ? 'bg-primary' : ''}
                  >
                    {airline.name}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Flight List */}
        <div className="space-y-4">
          {filteredFlights.length > 0 ? (
            filteredFlights.map((flight, index) => (
              <motion.div
                key={flight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FlightCard flight={flight} seatClass={seatClass} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Plane className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No flights found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or selecting different dates
              </p>
              <Button variant="outline" asChild>
                <a href="/">New Search</a>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
