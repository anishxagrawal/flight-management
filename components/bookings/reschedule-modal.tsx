'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Plane, Calendar, Clock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { BookingWithDetails, FlightWithDetails } from '@/lib/types'

interface RescheduleModalProps {
  open: boolean
  onClose: () => void
  booking: BookingWithDetails
  onSuccess: () => void
}

export default function RescheduleModal({ open, onClose, booking, onSuccess }: RescheduleModalProps) {
  const [availableFlights, setAvailableFlights] = useState<FlightWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (open && booking) {
      fetchAvailableFlights()
    }
  }, [open, booking])

  const fetchAvailableFlights = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('flights')
        .select(`
          *,
          airline:airlines(*),
          aircraft:aircraft(*),
          origin_airport:airports!flights_origin_airport_id_fkey(*),
          destination_airport:airports!flights_destination_airport_id_fkey(*)
        `)
        .eq('origin_airport_id', booking.flight.origin_airport_id)
        .eq('destination_airport_id', booking.flight.destination_airport_id)
        .eq('status', 'scheduled')
        .neq('id', booking.flight_id)
        .gte('departure_time', new Date().toISOString())
        .order('departure_time', { ascending: true })
        .limit(10)

      if (error) throw error
      setAvailableFlights(data || [])
    } catch (error) {
      console.error('Error fetching flights:', error)
      toast.error('Failed to load available flights')
    } finally {
      setLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!selectedFlightId) {
      toast.error('Please select a flight')
      return
    }

    const selectedFlight = availableFlights.find(f => f.id === selectedFlightId)
    if (!selectedFlight) return

    // Calculate fee difference
    const priceDifference = selectedFlight.base_price - booking.flight.base_price
    const feeCharged = priceDifference > 0 ? priceDifference : 0

    setRescheduling(true)
    try {
      // Insert reschedule record
      const { error: rescheduleError } = await supabase
        .from('reschedules')
        .insert({
          booking_id: booking.id,
          old_flight_id: booking.flight_id,
          new_flight_id: selectedFlightId,
          fee_charged: feeCharged,
        })

      if (rescheduleError) throw rescheduleError

      // Update booking with new flight
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          flight_id: selectedFlightId,
          status: 'rescheduled',
          total_price: booking.total_price + feeCharged,
        })
        .eq('id', booking.id)

      if (updateError) throw updateError

      toast.success(
        feeCharged > 0
          ? `Flight rescheduled! Additional fee: $${feeCharged.toFixed(2)}`
          : 'Flight rescheduled successfully!'
      )
      onSuccess()
      onClose()
    } catch (error: unknown) {
      console.error('Reschedule error:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Failed to reschedule flight')
      }
    } finally {
      setRescheduling(false)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden pointer-events-auto shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Reschedule Flight</h2>
                  <p className="text-sm text-gray-400">
                    {booking.flight.origin_airport.code} → {booking.flight.destination_airport.code}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                  </div>
                ) : availableFlights.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No alternative flights available on this route</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableFlights.map((flight) => {
                      const priceDiff = flight.base_price - booking.flight.base_price
                      const isSelected = selectedFlightId === flight.id

                      return (
                        <button
                          key={flight.id}
                          onClick={() => setSelectedFlightId(flight.id)}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-500/10'
                              : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <Plane className="w-5 h-5 text-cyan-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-white">{flight.flight_number}</p>
                                <p className="text-xs text-gray-400">{flight.aircraft.manufacturer} {flight.aircraft.model}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-white">${flight.base_price.toFixed(2)}</p>
                              {priceDiff !== 0 && (
                                <p className={`text-xs ${priceDiff > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                                  {priceDiff > 0 ? '+' : ''}${priceDiff.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(flight.departure_time), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {format(new Date(flight.departure_time), 'HH:mm')}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {availableFlights.length > 0 && (
                <div className="p-6 border-t border-white/10">
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 text-sm font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReschedule}
                      disabled={!selectedFlightId || rescheduling}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-semibold transition-all duration-200"
                    >
                      {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
