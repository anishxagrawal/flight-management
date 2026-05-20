'use client'

import { motion } from 'framer-motion'
import { Plane, Globe, Shield, Clock } from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: '200+ Destinations',
    description: 'Fly anywhere in the world',
  },
  {
    icon: Shield,
    title: 'Secure Booking',
    description: 'Your data is protected',
  },
  {
    icon: Clock,
    title: 'Real-time Updates',
    description: 'Live seat availability',
  },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Animated Planes */}
        <motion.div
          initial={{ x: '-100%', y: 50 }}
          animate={{ x: '100vw', y: -50 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/3 opacity-10"
        >
          <Plane className="h-8 w-8 text-primary rotate-[-30deg]" />
        </motion.div>
        <motion.div
          initial={{ x: '-100%', y: 100 }}
          animate={{ x: '100vw', y: -100 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear', delay: 5 }}
          className="absolute top-1/2 opacity-5"
        >
          <Plane className="h-12 w-12 text-primary rotate-[-30deg]" />
        </motion.div>
        
        {/* Radar Circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <motion.div
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 w-64 h-64 rounded-full border border-primary/30"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute inset-0 w-64 h-64 rounded-full border border-primary/30"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 3, repeat: Infinity, delay: 2 }}
              className="absolute inset-0 w-64 h-64 rounded-full border border-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Real-time seat booking available
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance"
        >
          <span className="text-foreground">Discover the World</span>
          <br />
          <span className="gradient-text">One Flight at a Time</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto text-pretty"
        >
          Experience next-generation flight booking with real-time seat selection, 
          stunning animations, and a premium travel experience.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-button"
            >
              <feature.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{feature.title}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
