import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ConfirmationPage } from './confirmation-page'

interface PageProps {
  params: Promise<{ bookingId: string }>
}

export default async function BookingConfirmationPage({ params }: PageProps) {
  const { bookingId } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Fetch booking with all details
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      flight:flights(
        *,
        airline:airlines(*),
        aircraft:aircraft(*),
        origin_airport:airports!flights_origin_airport_id_fkey(*),
        destination_airport:airports!flights_destination_airport_id_fkey(*)
      ),
      passengers(
        *,
        seat:seats(*)
      )
    `)
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single()
  
  if (error || !booking) {
    notFound()
  }
  
  return <ConfirmationPage booking={booking} />
}
