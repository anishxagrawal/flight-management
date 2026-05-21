import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { FlightSearchForm } from '@/components/flight-search-form'
import { PopularDestinations } from '@/components/popular-destinations'
import { Footer } from '@/components/footer'

export const metadata = {
  title: 'SkyVoyage — Book Flights with Real-Time Seat Selection',
  description: 'Book premium flights with live seat availability, real-time updates, and a seamless booking experience.',
  openGraph: {
    title: 'SkyVoyage — Modern Flight Booking',
    description: 'Premium flight booking with real-time seat selection.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      
      {/* Search Form - Positioned over hero */}
      <div className="relative z-20 -mt-32 pb-12 px-4">
        <FlightSearchForm />
      </div>
      
      <PopularDestinations />
      <Footer />
    </main>
  )
}
