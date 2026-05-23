-- Seed data aligned to remote schema

INSERT INTO airports (code, name, city, country, timezone)
VALUES
  ('DEL', 'Indira Gandhi International Airport', 'Delhi', 'India', 'Asia/Kolkata'),
  ('BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India', 'Asia/Kolkata'),
  ('BLR', 'Kempegowda International Airport', 'Bangalore', 'India', 'Asia/Kolkata'),
  ('HYD', 'Rajiv Gandhi International Airport', 'Hyderabad', 'India', 'Asia/Kolkata'),
  ('CCU', 'Netaji Subhas Chandra Bose International Airport', 'Kolkata', 'India', 'Asia/Kolkata'),
  ('MAA', 'Chennai International Airport', 'Chennai', 'India', 'Asia/Kolkata'),
  ('GOI', 'Manohar International Airport', 'Goa', 'India', 'Asia/Kolkata'),
  ('PNQ', 'Pune International Airport', 'Pune', 'India', 'Asia/Kolkata'),
  ('COK', 'Cochin International Airport', 'Kochi', 'India', 'Asia/Kolkata'),
  ('JAI', 'Jaipur International Airport', 'Jaipur', 'India', 'Asia/Kolkata')
ON CONFLICT (code) DO NOTHING;

INSERT INTO airlines (code, name, logo_url)
VALUES
  ('SV', 'SkyVoyage', null),
  ('AI', 'Air India', null),
  ('6E', 'IndiGo', null),
  ('UK', 'Vistara', null),
  ('SG', 'SpiceJet', null),
  ('G8', 'Go First', null),
  ('IX', 'Air India Express', null),
  ('QP', 'Akasa Air', null)
ON CONFLICT (code) DO NOTHING;

INSERT INTO aircraft (model, manufacturer, total_seats, first_class_seats, business_class_seats, economy_class_seats)
VALUES
  ('737-800', 'Boeing', 189, 12, 24, 153),
  ('A320', 'Airbus', 180, 12, 24, 144),
  ('787-9', 'Boeing', 290, 24, 40, 226),
  ('A350', 'Airbus', 300, 24, 42, 234),
  ('A321neo', 'Airbus', 220, 16, 32, 172)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION generate_route_flights(
  p_origin_code TEXT,
  p_destination_code TEXT,
  p_base_flight_no INT,
  p_duration_hours INT,
  p_base_price NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_origin_id UUID;
  v_destination_id UUID;
  v_airline_ids UUID[];
  v_aircraft_ids UUID[];
  v_day INT;
  v_time_slot INT;
  v_flight_no TEXT;
  v_depart_time TIMESTAMPTZ;
  v_arrive_time TIMESTAMPTZ;
  v_flight_id UUID;
  v_airline_id UUID;
  v_aircraft_id UUID;
  v_price NUMERIC;
BEGIN
  SELECT id INTO v_origin_id FROM airports WHERE code = p_origin_code;
  SELECT id INTO v_destination_id FROM airports WHERE code = p_destination_code;
  IF v_origin_id IS NULL OR v_destination_id IS NULL THEN
    RETURN;
  END IF;

  SELECT array_agg(id ORDER BY code) INTO v_airline_ids FROM airlines;
  SELECT array_agg(id ORDER BY model) INTO v_aircraft_ids FROM aircraft;

  FOR v_day IN 0..29 LOOP
    FOR v_time_slot IN 1..3 LOOP
      v_flight_no := 'SV' || p_base_flight_no || LPAD(v_time_slot::TEXT, 2, '0');

      v_depart_time := (CURRENT_DATE + (v_day || ' days')::INTERVAL) +
        CASE v_time_slot
          WHEN 1 THEN INTERVAL '6 hours'
          WHEN 2 THEN INTERVAL '14 hours'
          WHEN 3 THEN INTERVAL '20 hours'
        END;

      v_arrive_time := v_depart_time + (p_duration_hours || ' hours')::INTERVAL;
      v_price := p_base_price + (p_base_price * 0.2 * ((v_day % 7) - 3) / 3);

      v_airline_id := v_airline_ids[((v_day * 3 + v_time_slot - 1) % array_length(v_airline_ids, 1)) + 1];
      v_aircraft_id := v_aircraft_ids[((v_day * 3 + v_time_slot - 1) % array_length(v_aircraft_ids, 1)) + 1];

      v_flight_id := gen_random_uuid();

      INSERT INTO flights (
        id,
        flight_number,
        airline_id,
        aircraft_id,
        origin_airport_id,
        destination_airport_id,
        departure_time,
        arrival_time,
        base_price,
        business_price,
        first_class_price,
        status
      )
      VALUES (
        v_flight_id,
        v_flight_no,
        v_airline_id,
        v_aircraft_id,
        v_origin_id,
        v_destination_id,
        v_depart_time,
        v_arrive_time,
        v_price,
        v_price * 1.5,
        v_price * 2,
        'scheduled'
      );

      PERFORM generate_seats_for_flight(v_flight_id);
    END LOOP;
  END LOOP;
END;
$$;

SELECT generate_route_flights('DEL', 'BOM', 101, 2, 4500.00);
SELECT generate_route_flights('DEL', 'BLR', 102, 3, 6500.00);
SELECT generate_route_flights('DEL', 'HYD', 103, 2, 5500.00);
SELECT generate_route_flights('DEL', 'CCU', 104, 2, 5000.00);
SELECT generate_route_flights('DEL', 'MAA', 105, 3, 6000.00);

SELECT generate_route_flights('BOM', 'DEL', 201, 2, 4500.00);
SELECT generate_route_flights('BOM', 'BLR', 202, 2, 3500.00);
SELECT generate_route_flights('BOM', 'HYD', 203, 1, 3000.00);
SELECT generate_route_flights('BOM', 'CCU', 204, 3, 5500.00);
SELECT generate_route_flights('BOM', 'MAA', 205, 2, 4000.00);

SELECT generate_route_flights('BLR', 'DEL', 301, 3, 6500.00);
SELECT generate_route_flights('BLR', 'BOM', 302, 2, 3500.00);
SELECT generate_route_flights('BLR', 'HYD', 303, 1, 2500.00);
SELECT generate_route_flights('BLR', 'CCU', 304, 3, 5000.00);
SELECT generate_route_flights('BLR', 'MAA', 305, 1, 2800.00);

SELECT generate_route_flights('HYD', 'DEL', 401, 2, 5500.00);
SELECT generate_route_flights('HYD', 'BOM', 402, 1, 3000.00);
SELECT generate_route_flights('HYD', 'BLR', 403, 1, 2500.00);
SELECT generate_route_flights('HYD', 'CCU', 404, 2, 4500.00);
SELECT generate_route_flights('HYD', 'MAA', 405, 1, 2800.00);

SELECT generate_route_flights('CCU', 'DEL', 501, 2, 5000.00);
SELECT generate_route_flights('CCU', 'BOM', 502, 3, 5500.00);
SELECT generate_route_flights('CCU', 'BLR', 503, 3, 5000.00);
SELECT generate_route_flights('CCU', 'HYD', 504, 2, 4500.00);
SELECT generate_route_flights('CCU', 'MAA', 505, 2, 4000.00);

SELECT generate_route_flights('MAA', 'DEL', 601, 3, 6000.00);
SELECT generate_route_flights('MAA', 'BOM', 602, 2, 4000.00);
SELECT generate_route_flights('MAA', 'BLR', 603, 1, 2800.00);
SELECT generate_route_flights('MAA', 'HYD', 604, 1, 2800.00);
SELECT generate_route_flights('MAA', 'CCU', 605, 2, 4000.00);

DROP FUNCTION IF EXISTS generate_route_flights(TEXT, TEXT, INT, INT, NUMERIC);
