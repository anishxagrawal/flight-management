import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { FlightSearchForm } from '@/components/flight-search-form'
import { PopularDestinations } from '@/components/popular-destinations'
import { Footer } from '@/components/footer'

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
