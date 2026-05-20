'use client'

import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Hero Content */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance tracking-tight font-sans"
      >
        <span className="text-[#e5e2e1]">Command the </span>
        <span className="text-[#00a3ff]">Airspace.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg md:text-xl text-[#bec7d4] mb-8 max-w-2xl mx-auto text-pretty font-sans"
      >
        Experience high-stakes aviation management with precision instrumentation
      </motion.p>
    </div>
  )
}
