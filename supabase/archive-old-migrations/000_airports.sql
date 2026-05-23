-- Create airports reference table for better UX
-- This is optional but makes the search form more user-friendly

CREATE TABLE IF NOT EXISTS airports_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE airports_reference ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view airports"
  ON airports_reference FOR SELECT
  USING (true);

-- Insert major Indian airports
INSERT INTO airports_reference (code, name, city, country) VALUES
  ('DEL', 'Indira Gandhi International Airport', 'Delhi', 'India'),
  ('BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India'),
  ('BLR', 'Kempegowda International Airport', 'Bangalore', 'India'),
  ('HYD', 'Rajiv Gandhi International Airport', 'Hyderabad', 'India'),
  ('CCU', 'Netaji Subhas Chandra Bose International Airport', 'Kolkata', 'India'),
  ('MAA', 'Chennai International Airport', 'Chennai', 'India');

-- Create index for faster lookups
CREATE INDEX idx_airports_code ON airports_reference(code);
CREATE INDEX idx_airports_city ON airports_reference(city);
