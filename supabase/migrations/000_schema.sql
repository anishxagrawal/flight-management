-- Schema aligned to remote Supabase

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS airports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  timezone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS airlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  total_seats INTEGER NOT NULL,
  first_class_seats INTEGER DEFAULT 0,
  business_class_seats INTEGER DEFAULT 0,
  economy_class_seats INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number TEXT NOT NULL,
  airline_id UUID NOT NULL REFERENCES airlines(id) ON DELETE CASCADE,
  aircraft_id UUID NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
  origin_airport_id UUID NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  destination_airport_id UUID NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  base_price NUMERIC NOT NULL,
  business_price NUMERIC,
  first_class_price NUMERIC,
  status TEXT DEFAULT 'scheduled' CHECK (status = ANY (ARRAY['scheduled','boarding','departed','arrived','cancelled','delayed'])),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  seat_class TEXT NOT NULL CHECK (seat_class = ANY (ARRAY['economy','business','first'])),
  seat_row INTEGER NOT NULL,
  seat_column TEXT NOT NULL,
  is_window BOOLEAN DEFAULT false,
  is_aisle BOOLEAN DEFAULT false,
  is_emergency_exit BOOLEAN DEFAULT false,
  extra_legroom BOOLEAN DEFAULT false,
  price_modifier NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'available' CHECK (status = ANY (ARRAY['available','occupied','blocked','selected'])),
  selected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  selected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (flight_id, seat_number)
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  pnr_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'confirmed' CHECK (status = ANY (ARRAY['pending','confirmed','cancelled','completed','rescheduled'])),
  total_price NUMERIC NOT NULL,
  booking_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  seat_id UUID REFERENCES seats(id)
);

CREATE TABLE IF NOT EXISTS passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id UUID REFERENCES seats(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  passport_number TEXT,
  nationality TEXT,
  date_of_birth DATE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reschedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  old_flight_id UUID NOT NULL REFERENCES flights(id),
  new_flight_id UUID NOT NULL REFERENCES flights(id),
  requested_at TIMESTAMPTZ DEFAULT now(),
  fee_charged NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  passport_number TEXT,
  nationality TEXT,
  date_of_birth DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flights_origin ON flights(origin_airport_id);
CREATE INDEX IF NOT EXISTS idx_flights_destination ON flights(destination_airport_id);
CREATE INDEX IF NOT EXISTS idx_flights_departure ON flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_seats_flight ON seats(flight_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pnr ON bookings(pnr_code);
