import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FlightResults } from './flight-results'

interface FlightsPageProps {
  searchParams: Promise<{
    origin?: string
    destination?: string
    date?: string
    passengers?: string
    class?: string
  }>
}

export default async function FlightsPage({ searchParams }: FlightsPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  
  // Fetch flights with all related data
  let query = supabase
    .from('flights')
    .select(`
      *,
      airline:airlines(*),
      aircraft:aircraft(*),
      origin_airport:airports!flights_origin_airport_id_fkey(*),
      destination_airport:airports!flights_destination_airport_id_fkey(*)
    `)
    .eq('status', 'scheduled')
    .order('departure_time', { ascending: true })
  
  // Apply filters
  if (params.origin) {
    query = query.eq('origin_airport_id', params.origin)
  }
  if (params.destination) {
    query = query.eq('destination_airport_id', params.destination)
  }
  if (params.date) {
    const startDate = new Date(params.date)
    const endDate = new Date(params.date)
    endDate.setDate(endDate.getDate() + 1)
    query = query
      .gte('departure_time', startDate.toISOString())
      .lt('departure_time', endDate.toISOString())
  }
  
  const { data: flights } = await query
  
  // Fetch airports for filter
  const { data: airports } = await supabase
    .from('airports')
    .select('*')
    .order('city')
  
  return (
    <main className="min-h-screen">
      <Header />
      <FlightResults 
        initialFlights={flights || []} 
        airports={airports || []}
        searchParams={params}
      />
      <Footer />
    </main>
  )
}
