import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from '@/components/profile/profile-client'

export const metadata = {
  title: 'My Profile | SkyVoyage',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, status, total_price, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <ProfileClient user={user} bookings={bookings || []} />
}
