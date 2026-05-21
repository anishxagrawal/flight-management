'use client'

import { motion } from 'framer-motion'
import { Plane, Calendar, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import type { BookingWithDetails } from '@/lib/types'

const statusConfig = {
  confirmed: {
    label: 'Confirmed',
    className: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    pulse: true,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-500/10 text-red-400 border border-red-500/20',
    pulse: false,
  },
  completed: {
    label: 'Completed',
    className: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    pulse: false,
  },
  rescheduled: {
    label: 'Rescheduled',
    className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    pulse: false,
  },
  pending: {
    label: 'Pending',
    className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    pulse: true,
  },
}

export default function BookingCard({ 
  booking, 
  onCancel,
  onReschedule 
}: { 
  booking: BookingWithDetails
  onCancel: () => void
  onReschedule?: () => void
}) {
  const flight = booking.flight
  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending
  const canCancel = booking.status === 'confirmed'
  const canReschedule = booking.status === 'confirmed' && onReschedule

  return (
    <div className="relative bg-white/3 backdrop-blur-sm border border-white/8 rounded-2xl p-6 hover:border-cyan-500/20 transition-all duration-300 group">
      
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Flight Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Plane className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-semibold text-lg">
                {flight?.origin_airport?.code}
              </span>
              <div className="flex items-center gap-1">
                <div className="w-8 h-px bg-gray-600" />
                <Plane className="w-3 h-3 text-gray-500 rotate-90" />
                <div className="w-8 h-px bg-gray-600" />
              </div>
              <span className="text-white font-semibold text-lg">
                {flight?.destination_airport?.code}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              {flight?.origin_airport?.city} → {flight?.destination_airport?.city}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
            {status.pulse && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
              </span>
            )}
            {status.label}
          </span>
        </div>
      </div>

      {/* Details Row */}
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {flight?.departure_time
            ? format(new Date(flight.departure_time), 'MMM d, yyyy')
            : 'N/A'}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {flight?.departure_time
            ? format(new Date(flight.departure_time), 'HH:mm')
            : 'N/A'}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          PNR: <span className="text-white font-mono font-medium">{booking.pnr_code}</span>
        </div>
        <div className="ml-auto font-semibold text-white">
          ${booking.total_price?.toLocaleString('en-US')}
        </div>
      </div>

      {/* Actions */}
      {(canCancel || canReschedule) && (
        <div className="mt-4 flex justify-end gap-2">
          {canReschedule && (
            <button
              onClick={onReschedule}
              className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              Reschedule
            </button>
          )}
          {canCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              Cancel Booking
            </button>
          )}
        </div>
      )}
    </div>
  )
}
