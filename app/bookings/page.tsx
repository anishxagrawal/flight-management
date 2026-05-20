import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BookingsList } from './bookings-list'

export default async function BookingsPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Fetch all bookings for the user
  const { data: bookings } = await supabase
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
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  return (
    <main className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <Header />
      <BookingsList bookings={bookings || []} />
      <Footer />
    </main>
  )
}
