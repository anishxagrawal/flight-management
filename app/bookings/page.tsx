import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookingsDashboard from '@/components/bookings/bookings-dashboard'

export const metadata = {
  title: 'My Bookings | SkyVoyage',
  description: 'View and manage your flight bookings',
}

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      flight:flights(
        *,
        origin_airport:airports!flights_origin_airport_id_fkey(*),
        destination_airport:airports!flights_destination_airport_id_fkey(*),
        airline:airlines(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <BookingsDashboard bookings={bookings || []} />
}
