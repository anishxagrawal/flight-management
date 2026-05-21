import { Plane } from 'lucide-react'
import Link from 'next/link'

export default function BookingsEmpty({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
        <Plane className="w-9 h-9 text-cyan-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
      </h3>
      <p className="text-gray-400 mb-8 max-w-sm">
        {filter === 'all'
          ? "You haven't booked any flights yet. Start exploring destinations."
          : `You don't have any ${filter} bookings at the moment.`}
      </p>
      {filter === 'all' && (
        <Link
          href="/"
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition-colors duration-200"
        >
          Search Flights
        </Link>
      )}
    </div>
  )
}
