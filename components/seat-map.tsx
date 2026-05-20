'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Seat, SeatClass } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useBookingStore } from '@/lib/booking-store'

interface SeatMapProps {
  flightId: string
  initialSeats: Seat[]
  passengerCount: number
  seatClass: SeatClass
}

export function SeatMap({ flightId, initialSeats, passengerCount, seatClass }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>(initialSeats)
  const { selectedSeats, addSeat, removeSeat } = useBookingStore()
  const [userId, setUserId] = useState<string | null>(null)
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null)

  // Get current user
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null)
    })
  }, [])

  // Set up real-time subscription for seat updates
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel(`seats-${flightId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seats',
          filter: `flight_id=eq.${flightId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedSeat = payload.new as Seat
            setSeats((prevSeats) =>
              prevSeats.map((seat) =>
                seat.id === updatedSeat.id ? updatedSeat : seat
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [flightId])

  const handleSeatClick = useCallback(async (seat: Seat) => {
    if (!userId) {
      alert('Please sign in to select seats')
      return
    }
    
    if (seat.status === 'occupied' || seat.status === 'blocked') {
      return
    }

    // Check if this seat is selected by current user
    const isSelected = selectedSeats.some(s => s.id === seat.id)
    
    if (isSelected) {
      // Deselect seat
      removeSeat(seat.id)
      
      // Update in database
      const supabase = createClient()
      await supabase
        .from('seats')
        .update({ 
          status: 'available', 
          selected_by: null,
          selected_at: null 
        })
        .eq('id', seat.id)
    } else {
      // Check if max seats reached
      if (selectedSeats.length >= passengerCount) {
        alert(`You can only select ${passengerCount} seat(s)`)
        return
      }
      
      // Select seat
      const supabase = createClient()
      const { error } = await supabase
        .from('seats')
        .update({ 
          status: 'selected', 
          selected_by: userId,
          selected_at: new Date().toISOString()
        })
        .eq('id', seat.id)
        .eq('status', 'available')
      
      if (!error) {
        addSeat({ ...seat, status: 'selected', selected_by: userId })
      }
    }
  }, [userId, selectedSeats, passengerCount, addSeat, removeSeat])

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.seat_row
    if (!acc[row]) acc[row] = []
    acc[row].push(seat)
    return acc
  }, {} as Record<number, Seat[]>)

  // Sort seats within each row by column
  Object.keys(seatsByRow).forEach((row) => {
    seatsByRow[parseInt(row)].sort((a, b) => a.seat_column.localeCompare(b.seat_column))
  })

  const rows = Object.keys(seatsByRow).map(Number).sort((a, b) => a - b)

  const getSeatStyle = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id)
    const isHovered = hoveredSeat === seat.id
    
    // Filter by class if specified
    if (seatClass !== 'economy' && seat.seat_class !== seatClass) {
      return 'opacity-30 cursor-not-allowed'
    }
    
    if (seat.status === 'occupied') {
      return 'seat-occupied cursor-not-allowed'
    }
    
    if (seat.status === 'blocked') {
      return 'bg-destructive/20 border-destructive/30 cursor-not-allowed'
    }
    
    if (isSelected) {
      return 'seat-selected cursor-pointer'
    }
    
    if (seat.status === 'selected' && seat.selected_by !== userId) {
      return 'bg-yellow-500/20 border-yellow-500/50 cursor-not-allowed'
    }
    
    return `seat-available cursor-pointer ${isHovered ? 'scale-110' : ''}`
  }

  const getSeatLabel = (seat: Seat) => {
    if (seat.extra_legroom) return 'Extra Legroom'
    if (seat.is_emergency_exit) return 'Emergency Exit'
    if (seat.is_window) return 'Window'
    if (seat.is_aisle) return 'Aisle'
    return 'Standard'
  }

  return (
    <div className="relative">
      {/* Plane Outline */}
      <div className="relative mx-auto max-w-lg">
        {/* Cockpit */}
        <div className="w-32 h-16 mx-auto mb-4 rounded-t-full bg-secondary/30 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Cockpit</span>
        </div>

        {/* Cabin */}
        <div className="glass-card rounded-3xl p-6 overflow-x-auto">
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded seat-available" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded seat-selected" />
              <span>Your Selection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded seat-occupied" />
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/50" />
              <span>Being Selected</span>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="space-y-2">
            {rows.map((rowNum) => {
              const rowSeats = seatsByRow[rowNum]
              const seatClassForRow = rowSeats[0]?.seat_class

              // Add class dividers
              const showClassDivider = rowNum > 1 && 
                seatsByRow[rowNum - 1]?.[0]?.seat_class !== seatClassForRow

              return (
                <div key={rowNum}>
                  {showClassDivider && (
                    <div className="flex items-center gap-4 my-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {seatClassForRow === 'economy' ? 'Economy Class' : 
                         seatClassForRow === 'business' ? 'Business Class' : 'First Class'}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-1">
                    {/* Row number */}
                    <span className="w-6 text-xs text-muted-foreground text-right">
                      {rowNum}
                    </span>
                    
                    {/* Left seats (A, B, C) */}
                    <div className="flex gap-1">
                      {rowSeats
                        .filter(s => ['A', 'B', 'C'].includes(s.seat_column))
                        .map((seat) => (
                          <SeatButton
                            key={seat.id}
                            seat={seat}
                            style={getSeatStyle(seat)}
                            label={getSeatLabel(seat)}
                            onClick={() => handleSeatClick(seat)}
                            onHover={setHoveredSeat}
                            isSelected={selectedSeats.some(s => s.id === seat.id)}
                          />
                        ))}
                    </div>
                    
                    {/* Aisle */}
                    <div className="w-8" />
                    
                    {/* Right seats (D, E, F) */}
                    <div className="flex gap-1">
                      {rowSeats
                        .filter(s => ['D', 'E', 'F'].includes(s.seat_column))
                        .map((seat) => (
                          <SeatButton
                            key={seat.id}
                            seat={seat}
                            style={getSeatStyle(seat)}
                            label={getSeatLabel(seat)}
                            onClick={() => handleSeatClick(seat)}
                            onHover={setHoveredSeat}
                            isSelected={selectedSeats.some(s => s.id === seat.id)}
                          />
                        ))}
                    </div>
                    
                    {/* Row number */}
                    <span className="w-6 text-xs text-muted-foreground text-left">
                      {rowNum}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tail */}
        <div className="w-20 h-8 mx-auto mt-4 rounded-b-lg bg-secondary/30" />
      </div>

      {/* Seat Tooltip */}
      <AnimatePresence>
        {hoveredSeat && (
          <SeatTooltip 
            seat={seats.find(s => s.id === hoveredSeat)!}
            label={getSeatLabel(seats.find(s => s.id === hoveredSeat)!)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface SeatButtonProps {
  seat: Seat
  style: string
  label: string
  onClick: () => void
  onHover: (id: string | null) => void
  isSelected: boolean
}

function SeatButton({ seat, style, label, onClick, onHover, isSelected }: SeatButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center',
        style
      )}
      onClick={onClick}
      onMouseEnter={() => onHover(seat.id)}
      onMouseLeave={() => onHover(null)}
      disabled={seat.status === 'occupied' || seat.status === 'blocked'}
      aria-label={`Seat ${seat.seat_number} - ${label}`}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            ✓
          </motion.span>
        )}
        {!isSelected && (
          <span className="opacity-70">{seat.seat_column}</span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

interface SeatTooltipProps {
  seat: Seat
  label: string
}

function SeatTooltip({ seat, label }: SeatTooltipProps) {
  const priceModifier = Number(seat.price_modifier) || 0
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 glass-card rounded-lg p-3 z-50"
    >
      <div className="flex items-center gap-4">
        <div>
          <p className="font-semibold">Seat {seat.seat_number}</p>
          <p className="text-xs text-muted-foreground capitalize">{seat.seat_class}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{label}</p>
          {priceModifier > 0 && (
            <p className="text-xs text-primary">+${priceModifier}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
