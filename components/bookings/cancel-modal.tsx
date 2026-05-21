'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface CancelModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

export default function CancelModal({ open, onClose, onConfirm, loading }: CancelModalProps) {
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
            <div className="bg-[#0f1117] border border-white/10 rounded-2xl p-6 w-full max-w-md pointer-events-auto shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-lg font-semibold text-white mb-2">Cancel Booking</h2>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 text-sm font-medium transition-all duration-200"
                >
                  Keep Booking
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-sm font-semibold transition-all duration-200"
                >
                  {loading ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
