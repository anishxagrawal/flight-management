import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { SeatSelectionPage } from './seat-selection-page'

export const metadata = {
  title: 'Select Your Seat | SkyVoyage',
  description: 'Choose your perfect seat with real-time availability.',
}

interface PageProps {
  params: Promise<{ flightId: string }>
}

export default async function SeatsPage({ params }: PageProps) {
  const { flightId } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch flight with all details
  const { data: flight, error } = await supabase
    .from('flights')
    .select(`
      *,
      airline:airlines(*),
      aircraft:aircraft(*),
      origin_airport:airports!flights_origin_airport_id_fkey(*),
      destination_airport:airports!flights_destination_airport_id_fkey(*)
    `)
    .eq('id', flightId)
    .single()
  
  if (error || !flight) {
    notFound()
  }
  
  // Fetch seats for this flight
  const { data: seats } = await supabase
    .from('seats')
    .select('*')
    .eq('flight_id', flightId)
    .order('seat_row', { ascending: true })
  
  return (
    <SeatSelectionPage 
      flight={flight} 
      initialSeats={seats || []} 
      user={user}
    />
  )
}
