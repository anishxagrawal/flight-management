-- Comprehensive seed data for flights covering all route combinations
-- Cities: DEL (Delhi), BOM (Mumbai), BLR (Bangalore), HYD (Hyderabad), CCU (Kolkata), MAA (Chennai)
-- Multiple flights per route across next 30 days

-- Helper function to generate flights for a route
CREATE OR REPLACE FUNCTION generate_route_flights(
  p_origin TEXT,
  p_destination TEXT,
  p_base_flight_no INT,
  p_duration_hours INT,
  p_base_price NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_day INT;
  v_time_slot INT;
  v_flight_no TEXT;
  v_depart_time TIMESTAMPTZ;
  v_arrive_time TIMESTAMPTZ;
  v_aircraft TEXT;
  v_price NUMERIC;
  v_flight_id UUID;
BEGIN
  -- Generate flights for next 30 days
  FOR v_day IN 0..29 LOOP
    -- Generate 3 flights per day (morning, afternoon, evening)
    FOR v_time_slot IN 1..3 LOOP
      v_flight_no := 'SV' || p_base_flight_no || LPAD(v_time_slot::TEXT, 2, '0');
      
      -- Set departure times: 6 AM, 2 PM, 8 PM
      v_depart_time := (CURRENT_DATE + (v_day || ' days')::INTERVAL) + 
        CASE v_time_slot
          WHEN 1 THEN INTERVAL '6 hours'
          WHEN 2 THEN INTERVAL '14 hours'
          WHEN 3 THEN INTERVAL '20 hours'
        END;
      
      v_arrive_time := v_depart_time + (p_duration_hours || ' hours')::INTERVAL;
      
      -- Vary aircraft type
      v_aircraft := CASE (v_day + v_time_slot) % 4
        WHEN 0 THEN 'Boeing 737-800'
        WHEN 1 THEN 'Airbus A320'
        WHEN 2 THEN 'Boeing 787-9'
        ELSE 'Airbus A350'
      END;
      
      -- Vary price slightly (±20%)
      v_price := p_base_price + (p_base_price * 0.2 * ((v_day % 7) - 3) / 3);
      
      v_flight_id := gen_random_uuid();
      
      INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
      VALUES (v_flight_id, v_flight_no, p_origin, p_destination, v_depart_time, v_arrive_time, v_aircraft, 'scheduled', v_price);
      
      -- Generate seats for this flight
      PERFORM generate_seats_for_flight(v_flight_id);
    END LOOP;
  END LOOP;
END;
$$;

-- All possible route combinations (6 cities = 30 unique routes)

-- DEL (Delhi) routes
SELECT generate_route_flights('DEL', 'BOM', 101, 2, 4500.00);   -- Delhi → Mumbai
SELECT generate_route_flights('DEL', 'BLR', 102, 3, 6500.00);   -- Delhi → Bangalore
SELECT generate_route_flights('DEL', 'HYD', 103, 2, 5500.00);   -- Delhi → Hyderabad
SELECT generate_route_flights('DEL', 'CCU', 104, 2, 5000.00);   -- Delhi → Kolkata
SELECT generate_route_flights('DEL', 'MAA', 105, 3, 6000.00);   -- Delhi → Chennai

-- BOM (Mumbai) routes
SELECT generate_route_flights('BOM', 'DEL', 201, 2, 4500.00);   -- Mumbai → Delhi
SELECT generate_route_flights('BOM', 'BLR', 202, 2, 3500.00);   -- Mumbai → Bangalore
SELECT generate_route_flights('BOM', 'HYD', 203, 1, 3000.00);   -- Mumbai → Hyderabad
SELECT generate_route_flights('BOM', 'CCU', 204, 3, 5500.00);   -- Mumbai → Kolkata
SELECT generate_route_flights('BOM', 'MAA', 205, 2, 4000.00);   -- Mumbai → Chennai

-- BLR (Bangalore) routes
SELECT generate_route_flights('BLR', 'DEL', 301, 3, 6500.00);   -- Bangalore → Delhi
SELECT generate_route_flights('BLR', 'BOM', 302, 2, 3500.00);   -- Bangalore → Mumbai
SELECT generate_route_flights('BLR', 'HYD', 303, 1, 2500.00);   -- Bangalore → Hyderabad
SELECT generate_route_flights('BLR', 'CCU', 304, 3, 5000.00);   -- Bangalore → Kolkata
SELECT generate_route_flights('BLR', 'MAA', 305, 1, 2800.00);   -- Bangalore → Chennai

-- HYD (Hyderabad) routes
SELECT generate_route_flights('HYD', 'DEL', 401, 2, 5500.00);   -- Hyderabad → Delhi
SELECT generate_route_flights('HYD', 'BOM', 402, 1, 3000.00);   -- Hyderabad → Mumbai
SELECT generate_route_flights('HYD', 'BLR', 403, 1, 2500.00);   -- Hyderabad → Bangalore
SELECT generate_route_flights('HYD', 'CCU', 404, 2, 4500.00);   -- Hyderabad → Kolkata
SELECT generate_route_flights('HYD', 'MAA', 405, 1, 2800.00);   -- Hyderabad → Chennai

-- CCU (Kolkata) routes
SELECT generate_route_flights('CCU', 'DEL', 501, 2, 5000.00);   -- Kolkata → Delhi
SELECT generate_route_flights('CCU', 'BOM', 502, 3, 5500.00);   -- Kolkata → Mumbai
SELECT generate_route_flights('CCU', 'BLR', 503, 3, 5000.00);   -- Kolkata → Bangalore
SELECT generate_route_flights('CCU', 'HYD', 504, 2, 4500.00);   -- Kolkata → Hyderabad
SELECT generate_route_flights('CCU', 'MAA', 505, 2, 4000.00);   -- Kolkata → Chennai

-- MAA (Chennai) routes
SELECT generate_route_flights('MAA', 'DEL', 601, 3, 6000.00);   -- Chennai → Delhi
SELECT generate_route_flights('MAA', 'BOM', 602, 2, 4000.00);   -- Chennai → Mumbai
SELECT generate_route_flights('MAA', 'BLR', 603, 1, 2800.00);   -- Chennai → Bangalore
SELECT generate_route_flights('MAA', 'HYD', 604, 1, 2800.00);   -- Chennai → Hyderabad
SELECT generate_route_flights('MAA', 'CCU', 605, 2, 4000.00);   -- Chennai → Kolkata

-- Function to generate seats for a flight
CREATE OR REPLACE FUNCTION generate_seats_for_flight(
  p_flight_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_row INT;
  v_col TEXT;
  v_class TEXT;
  v_extra_fee NUMERIC;
BEGIN
  -- First Class: Rows 1-3, Columns A, B, C, D
  FOR v_row IN 1..3 LOOP
    FOR v_col IN SELECT unnest(ARRAY['A', 'B', 'C', 'D']) LOOP
      INSERT INTO seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (
        p_flight_id,
        v_row || v_col,
        'first',
        true,
        CASE 
          WHEN v_col IN ('A', 'D') THEN 500.00  -- Window seats extra
          ELSE 300.00
        END
      );
    END LOOP;
  END LOOP;

  -- Business Class: Rows 4-8, Columns A, B, C, D, E, F
  FOR v_row IN 4..8 LOOP
    FOR v_col IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) LOOP
      INSERT INTO seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (
        p_flight_id,
        v_row || v_col,
        'business',
        true,
        CASE 
          WHEN v_col IN ('A', 'F') THEN 200.00  -- Window seats extra
          WHEN v_col IN ('C', 'D') THEN 100.00  -- Aisle seats extra
          ELSE 50.00
        END
      );
    END LOOP;
  END LOOP;

  -- Economy Class: Rows 9-30, Columns A, B, C, D, E, F
  FOR v_row IN 9..30 LOOP
    FOR v_col IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) LOOP
      INSERT INTO seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (
        p_flight_id,
        v_row || v_col,
        'economy',
        true,
        CASE 
          WHEN v_row IN (12, 13) THEN 150.00  -- Exit row extra legroom
          WHEN v_col IN ('A', 'F') THEN 50.00  -- Window seats small extra
          ELSE 0.00
        END
      );
    END LOOP;
  END LOOP;
END;
$$;

-- Drop the helper functions after use
DROP FUNCTION IF EXISTS generate_route_flights(TEXT, TEXT, INT, INT, NUMERIC);
DROP FUNCTION IF EXISTS generate_seats_for_flight(UUID);

-- Note: Test user must be created manually via Supabase Auth Dashboard
-- Email: test@skyvoyage.com
-- Password: Test@123456
-- After creating the user, you can insert a test booking if needed
