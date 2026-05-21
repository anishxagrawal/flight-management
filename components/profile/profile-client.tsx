'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Plane, Calendar, CreditCard,
  LogOut, ChevronRight, Clock, TrendingUp, Award, Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFlightStore } from '@/lib/stores/flight-store'
import { format } from 'date-fns'

interface Booking {
  id: string
  status: string
  total_price: number
  created_at: string
}

interface ProfileClientProps {
  user: {
    id: string
    email?: string
    user_metadata?: { full_name?: string; avatar_url?: string }
    created_at?: string
  }
  bookings: Booking[]
}

const statusColors: Record<string, string> = {
  confirmed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
  completed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  rescheduled: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  pending: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
}

export default function ProfileClient({ user, bookings }: ProfileClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const resetStore = useFlightStore((s) => s.resetStore)
  const [loggingOut, setLoggingOut] = useState(false)

  const totalSpent = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0)

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length
  const completedCount = bookings.filter((b) => b.status === 'completed').length

  const memberSince = user.created_at
    ? format(new Date(user.created_at), 'MMM yyyy')
    : 'N/A'

  const getTierInfo = () => {
    if (totalSpent >= 10000) return { label: 'Platinum', color: 'from-slate-300 to-white', icon: '💎' }
    if (totalSpent >= 5000) return { label: 'Gold', color: 'from-yellow-400 to-amber-300', icon: '🥇' }
    if (totalSpent >= 1000) return { label: 'Silver', color: 'from-gray-300 to-gray-400', icon: '🥈' }
    return { label: 'Explorer', color: 'from-cyan-400 to-blue-400', icon: '✈️' }
  }

  const tier = getTierInfo()

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    resetStore()
    router.push('/')
  }

  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || 'TU'

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-28 pb-20">

        {/* HERO CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-8"
        >
          <div className="relative rounded-3xl overflow-hidden border border-white/8 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-600/5 to-transparent rounded-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-center gap-6">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-3xl font-bold text-cyan-300">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#080a0f] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {user.user_metadata?.full_name || 'Traveller'}
                  </h1>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${tier.color} text-black`}>
                    <span>{tier.icon}</span>
                    {tier.label} Member
                  </span>
                </div>
                <p className="text-gray-400 flex items-center gap-1.5 text-sm mb-3">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-500/70" />
                    Member since {memberSince}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-500/70" />
                    Verified Account
                  </span>
                </div>
              </div>

              <Link
                href="/bookings"
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm transition-all duration-200"
              >
                <Calendar className="w-4 h-4" />
                My Bookings
              </Link>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Flights', value: bookings.length, icon: Plane, color: 'text-cyan-400', bg: 'from-cyan-500/10 to-cyan-500/5', border: 'border-cyan-500/20' },
            { label: 'Confirmed', value: confirmedCount, icon: Award, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-500/20' },
            { label: 'Completed', value: completedCount, icon: TrendingUp, color: 'text-blue-400', bg: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-500/20' },
            { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: CreditCard, color: 'text-amber-400', bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-500/20' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className={`relative rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.bg} backdrop-blur-sm p-5 overflow-hidden hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3 opacity-80`} />
              <p className={`text-2xl font-bold ${stat.color} mb-0.5`}>{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* BOTTOM GRID */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Recent Bookings
              </h2>
              <Link href="/bookings" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {recentBookings.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Plane className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No bookings yet</p>
                  <Link href="/" className="inline-block mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                    Search flights →
                  </Link>
                </div>
              ) : (
                recentBookings.map((booking, i) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Plane className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">
                          #{booking.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(booking.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${statusColors[booking.status] || statusColors.pending}`}>
                        {booking.status}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        ${booking.total_price?.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Side Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col gap-4"
          >
            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h2 className="font-semibold text-white text-sm">Quick Actions</h2>
              </div>
              <div className="p-3 flex flex-col gap-1">
                {[
                  { label: 'Search Flights', icon: Plane, href: '/', color: 'text-cyan-400' },
                  { label: 'My Bookings', icon: Calendar, href: '/bookings', color: 'text-blue-400' },
                  { label: 'Recent Activity', icon: Clock, href: '/bookings', color: 'text-purple-400' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-150 group"
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm">{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Membership Card */}
            <div className="relative rounded-2xl overflow-hidden p-5 bg-gradient-to-br from-cyan-900/40 to-blue-900/30 border border-cyan-500/20">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
              <div className="absolute top-3 right-3 opacity-10">
                <Plane className="w-16 h-16 text-cyan-300 rotate-45" />
              </div>
              <p className="text-xs text-cyan-400/70 uppercase tracking-widest mb-1 font-medium">Membership</p>
              <p className={`text-xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-3`}>
                {tier.icon} {tier.label}
              </p>
              <div className="h-1 rounded-full bg-white/10 mb-1">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${tier.color}`}
                  style={{ width: `${Math.min((totalSpent / 10000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                ${totalSpent.toLocaleString()} / $10,000 to Platinum
              </p>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 text-sm font-medium transition-all duration-200 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
