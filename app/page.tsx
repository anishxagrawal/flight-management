import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { FlightSearchForm } from '@/components/flight-search-form'
import { PopularDestinations } from '@/components/popular-destinations'
import { Footer } from '@/components/footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#131313] text-[#e5e2e1] antialiased overflow-x-hidden">
      <Header />
      
      {/* Main Content with background effects */}
      <div className="relative pt-24 md:pt-32 pb-20">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Map dot pattern */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(0, 163, 255, 0.05) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Glowing Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00a3ff]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#7000ff]/5 rounded-full blur-[120px]" />
        </div>

        {/* Hero Section */}
        <section className="relative z-10 px-4 md:px-10 min-h-[716px] flex flex-col justify-center items-center text-center max-w-5xl mx-auto">
          <HeroSection />
          
          {/* Floating Search Widget (Glassmorphism) */}
          <div className="w-full max-w-4xl mt-12 relative z-20">
            <FlightSearchForm />
          </div>
        </section>
      </div>

      {/* Premium Bento Grid Section */}
      <PopularDestinations />
      
      <Footer />
    </main>
  )
}
