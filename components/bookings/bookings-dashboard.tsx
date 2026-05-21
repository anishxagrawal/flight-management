'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import BookingCard from './booking-card'
import BookingsEmpty from './bookings-empty'
import CancelModal from './cancel-modal'
import RescheduleModal from './reschedule-modal'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore } from '@/lib/stores/flight-store'
import type { BookingWithDetails } from '@/lib/types'

interface BookingsDashboardProps {
  bookings: BookingWithDetails[]
}

export default function BookingsDashboard({ bookings: initialBookings }: BookingsDashboardProps) {
  const [bookings, setBookings] = useState(initialBookings)
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled'>('all')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const supabase = createClient()
  const { resetStore } = useFlightStore()

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const handleCancelClick = (booking: BookingWithDetails) => {
    setSelectedBooking(booking)
    setCancelModalOpen(true)
  }

  const handleRescheduleClick = (booking: BookingWithDetails) => {
    setSelectedBooking(booking)
    setRescheduleModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return
    setCancelling(true)

    try {
      // Call the cancel_booking RPC function
      const { error } = await supabase.rpc('cancel_booking', {
        p_booking_id: selectedBooking.id
      })

      if (error) {
        // Supabase RPC errors come in error.message
        const message = error.message || 'Failed to cancel booking'
        // Check for the 2-hour rule error
        if (message.includes('2 hours') || message.includes('Cannot cancel')) {
          toast.error('Cannot cancel within 2 hours of departure.')
        } else {
          toast.error(message)
        }
        return
      }

      // Success - update local state
      setBookings(prev => prev.map(b =>
        b.id === selectedBooking.id ? { ...b, status: 'cancelled' } : b
      ))
      
      // Reset flight store state after cancellation
      resetStore()
      
      toast.success('Booking cancelled successfully.')
    } catch (error) {
      console.error('Cancel error:', error)
      toast.error('Failed to cancel booking. Please try again.')
    } finally {
      setCancelling(false)
      setCancelModalOpen(false)
      setSelectedBooking(null)
    }
  }

  const handleRescheduleSuccess = async () => {
    // Refresh bookings after reschedule
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          flight:flights(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setBookings(data)
      }
    } catch (error) {
      console.error('Error refreshing bookings:', error)
    }
  }

  const filters = ['all', 'confirmed', 'cancelled', 'completed', 'rescheduled'] as const

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-gray-400">Manage and track all your flights</p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                filter === f
                  ? 'bg-cyan-500 text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <BookingsEmpty filter={filter} />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-4">
              {filtered.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BookingCard
                    booking={booking}
                    onCancel={() => handleCancelClick(booking)}
                    onReschedule={() => handleRescheduleClick(booking)}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Cancel Modal */}
      <CancelModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        loading={cancelling}
      />

      {/* Reschedule Modal */}
      {selectedBooking && (
        <RescheduleModal
          open={rescheduleModalOpen}
          onClose={() => setRescheduleModalOpen(false)}
          booking={selectedBooking}
          onSuccess={handleRescheduleSuccess}
        />
      )}
    </div>
  )
}
