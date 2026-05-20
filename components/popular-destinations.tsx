'use client'

import { motion } from 'framer-motion'
import { Plane, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const destinations = [
  {
    city: 'New York',
    country: 'United States',
    code: 'JFK',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    price: 'From $349',
  },
  {
    city: 'London',
    country: 'United Kingdom',
    code: 'LHR',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    price: 'From $599',
  },
  {
    city: 'Dubai',
    country: 'UAE',
    code: 'DXB',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    price: 'From $799',
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    code: 'SIN',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
    price: 'From $899',
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    code: 'HND',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    price: 'From $999',
  },
  {
    city: 'Paris',
    country: 'France',
    code: 'CDG',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    price: 'From $549',
  },
]

export function PopularDestinations() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Popular <span className="gradient-text">Destinations</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our most booked destinations and find your next adventure
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-2xl glass-card"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative p-6 h-64 flex flex-col justify-end">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{dest.city}</h3>
                    <p className="text-sm text-muted-foreground">{dest.country}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{dest.code}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-primary font-semibold">{dest.price}</span>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors"
                  >
                    Explore <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </div>

                {/* Animated plane on hover */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plane className="h-6 w-6 text-primary rotate-[-30deg]" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
