-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create flights table
CREATE TABLE flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_no TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departs_at TIMESTAMPTZ NOT NULL,
  arrives_at TIMESTAMPTZ NOT NULL,
  aircraft_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  base_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create seats table
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  class TEXT NOT NULL CHECK (class IN ('economy', 'business', 'first')),
  is_available BOOLEAN DEFAULT TRUE,
  extra_fee NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(flight_id, seat_number)
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE RESTRICT,
  seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'rescheduled')),
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  total_price NUMERIC(10, 2) NOT NULL,
  pnr_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create passengers table
CREATE TABLE passengers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  passport_no TEXT,
  nationality TEXT,
  dob DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reschedules table
CREATE TABLE reschedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE RESTRICT,
  new_flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE RESTRICT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  fee_charged NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_flights_route ON flights(origin, destination, departs_at);
CREATE INDEX idx_flights_status ON flights(status);
CREATE INDEX idx_seats_flight_available ON seats(flight_id, is_available);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_flight ON bookings(flight_id);
CREATE INDEX idx_bookings_pnr ON bookings(pnr_code);
CREATE INDEX idx_passengers_booking ON passengers(booking_id);
CREATE INDEX idx_reschedules_booking ON reschedules(booking_id);

-- Enable Row Level Security on all tables
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for flights (public read, no write)
CREATE POLICY "Anyone can view flights"
  ON flights FOR SELECT
  USING (true);

-- RLS Policies for seats (public read, no direct write)
CREATE POLICY "Anyone can view seats"
  ON seats FOR SELECT
  USING (true);

-- RLS Policies for bookings (users can only access their own)
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
  ON bookings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for passengers (users can only access passengers of their bookings)
CREATE POLICY "Users can view passengers of their bookings"
  ON passengers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert passengers for their bookings"
  ON passengers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update passengers of their bookings"
  ON passengers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete passengers of their bookings"
  ON passengers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- RLS Policies for reschedules (users can only access reschedules of their bookings)
CREATE POLICY "Users can view reschedules of their bookings"
  ON reschedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reschedules.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reschedules for their bookings"
  ON reschedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reschedules.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reschedules of their bookings"
  ON reschedules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reschedules.booking_id
      AND bookings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reschedules.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reschedules of their bookings"
  ON reschedules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reschedules.booking_id
      AND bookings.user_id = auth.uid()
    )
  );
