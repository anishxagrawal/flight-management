import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BookingPage } from './booking-page'

interface PageProps {
  params: Promise<{ flightId: string }>
}

export default async function BookingFlowPage({ params }: PageProps) {
  const { flightId } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login?redirect=' + encodeURIComponent(`/flights/${flightId}/booking`))
  }
  
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
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return (
    <BookingPage 
      flight={flight}
      user={user}
      profile={profile}
    />
  )
}
