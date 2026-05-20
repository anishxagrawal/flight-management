'use client'

import { motion } from 'framer-motion'
import { Globe, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function PopularDestinations() {
  return (
    <section className="py-24 px-4 md:px-10 bg-[#131313]">
      <div className="container mx-auto max-w-6xl">
        {/* Bento Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Stats Card - Live Global Routes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-xl p-6 border border-white/5 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%), rgba(28, 27, 27, 0.5)',
            }}
          >
            {/* Top highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="flex items-center justify-between mb-8">
              <Globe className="h-8 w-8 text-[#00a3ff]" />
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ded1]/10 border border-[#00ded1]/20 text-[#00ded1] text-xs font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ded1] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ded1]" />
                </span>
                Live
              </span>
            </div>
            
            <div className="text-5xl md:text-6xl font-bold text-[#e5e2e1] mb-2 font-sans">
              4,280
            </div>
            <div className="text-sm text-[#bec7d4] font-mono tracking-wider uppercase">
              Active Global Routes
            </div>
          </motion.div>

          {/* Feature Card - Next-Gen Avionics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 relative rounded-xl p-6 border border-white/5 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%), rgba(28, 27, 27, 0.5)',
            }}
          >
            {/* Top highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <h3 className="text-2xl md:text-3xl font-semibold text-[#e5e2e1] mb-4 font-sans">
              Next-Gen Avionics Data
            </h3>
            
            <p className="text-[#bec7d4] mb-6 max-w-lg leading-relaxed">
              Integrate real-time weather, air traffic control feeds, and fleet telemetrics into a singular, cohesive command interface.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#2a2a2a] border border-white/10 text-[#e5e2e1] font-medium text-sm hover:bg-[#3a3939] transition-all font-mono tracking-wide"
            >
              View Instrumentation
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
