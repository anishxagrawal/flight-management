-- RLS policies aligned to remote Supabase

ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS aircraft_public_read ON aircraft;
CREATE POLICY aircraft_public_read ON aircraft
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS airlines_public_read ON airlines;
CREATE POLICY airlines_public_read ON airlines
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS airports_public_read ON airports;
CREATE POLICY airports_public_read ON airports
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS flights_public_read ON flights;
CREATE POLICY flights_public_read ON flights
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS seats_public_read ON seats;
CREATE POLICY seats_public_read ON seats
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS seats_update_available ON seats;
CREATE POLICY seats_update_available ON seats
  FOR UPDATE TO public
  USING ((status = 'available') OR (selected_by = auth.uid()));

DROP POLICY IF EXISTS bookings_select_own ON bookings;
CREATE POLICY bookings_select_own ON bookings
  FOR SELECT TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS bookings_insert_own ON bookings;
CREATE POLICY bookings_insert_own ON bookings
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS bookings_update_own ON bookings;
CREATE POLICY bookings_update_own ON bookings
  FOR UPDATE TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS passengers_select_own ON passengers;
CREATE POLICY passengers_select_own ON passengers
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS passengers_insert_own ON passengers;
CREATE POLICY passengers_insert_own ON passengers
  FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS passengers_update_own ON passengers;
CREATE POLICY passengers_update_own ON passengers
  FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT TO public
  USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT TO public
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO public
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage their own reschedules" ON reschedules;
CREATE POLICY "Users can manage their own reschedules" ON reschedules
  FOR ALL TO public
  USING (
    booking_id IN (
      SELECT bookings.id FROM bookings
      WHERE bookings.user_id = auth.uid()
    )
  );
