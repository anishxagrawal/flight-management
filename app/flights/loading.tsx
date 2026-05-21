import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import FlightCardSkeleton from '@/components/flights/flight-card-skeleton'

export default function FlightsLoading() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="h-8 w-64 bg-white/5 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <FlightCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
