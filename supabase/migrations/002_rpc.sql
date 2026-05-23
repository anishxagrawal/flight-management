-- RPCs and triggers aligned to remote Supabase

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_cancellation_time()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_departure timestamptz;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    SELECT f.departure_time INTO v_departure
    FROM flights f
    JOIN bookings b ON b.flight_id = f.id
    WHERE b.id = NEW.id;

    IF v_departure - now() < interval '2 hours' THEN
      RAISE EXCEPTION 'Cannot cancel within 2 hours of departure';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_departure timestamptz;
  v_seat_id uuid;
BEGIN
  SELECT f.departure_time, b.seat_id
  INTO v_departure, v_seat_id
  FROM bookings b
  JOIN flights f ON f.id = b.flight_id
  WHERE b.id = p_booking_id AND b.user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_departure - now() < interval '2 hours' THEN
    RAISE EXCEPTION 'Cannot cancel within 2 hours of departure';
  END IF;

  UPDATE bookings SET status = 'cancelled' WHERE id = p_booking_id;

  IF v_seat_id IS NOT NULL THEN
    UPDATE seats
    SET status = 'available', selected_by = null, selected_at = null
    WHERE id = v_seat_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.reserve_seat(p_seat_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status text;
  v_selected_by uuid;
BEGIN
  SELECT status, selected_by
  INTO v_status, v_selected_by
  FROM seats
  WHERE id = p_seat_id
  FOR UPDATE;

  IF v_status NOT IN ('available', 'selected') THEN
    RETURN false;
  END IF;

  IF v_status = 'selected' AND v_selected_by != p_user_id THEN
    RETURN false;
  END IF;

  UPDATE seats
  SET
    status = 'occupied',
    selected_by = p_user_id,
    selected_at = now()
  WHERE id = p_seat_id;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_seats_for_flight(p_flight_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_aircraft_id UUID;
  v_first_class INTEGER;
  v_business_class INTEGER;
  v_economy_class INTEGER;
  v_row INTEGER := 1;
  v_seat_columns TEXT[] := ARRAY['A', 'B', 'C', 'D', 'E', 'F'];
  v_col TEXT;
  v_first_rows INTEGER;
  v_business_rows INTEGER;
  v_economy_rows INTEGER;
BEGIN
  SELECT aircraft_id INTO v_aircraft_id FROM flights WHERE id = p_flight_id;
  SELECT first_class_seats, business_class_seats, economy_class_seats
  INTO v_first_class, v_business_class, v_economy_class
  FROM aircraft WHERE id = v_aircraft_id;

  v_first_rows := CEIL(COALESCE(v_first_class, 0)::FLOAT / 4);
  v_business_rows := CEIL(COALESCE(v_business_class, 0)::FLOAT / 6);
  v_economy_rows := CEIL(COALESCE(v_economy_class, 0)::FLOAT / 6);

  FOR v_row IN 1..GREATEST(v_first_rows, 0) LOOP
    FOREACH v_col IN ARRAY ARRAY['A', 'C', 'D', 'F'] LOOP
      INSERT INTO seats (flight_id, seat_number, seat_class, seat_row, seat_column, is_window, is_aisle, extra_legroom, price_modifier)
      VALUES (
        p_flight_id,
        v_row || v_col,
        'first',
        v_row,
        v_col,
        v_col IN ('A', 'F'),
        v_col IN ('C', 'D'),
        TRUE,
        50.00
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  FOR v_row IN (v_first_rows + 1)..(v_first_rows + GREATEST(v_business_rows, 0)) LOOP
    FOREACH v_col IN ARRAY v_seat_columns LOOP
      INSERT INTO seats (flight_id, seat_number, seat_class, seat_row, seat_column, is_window, is_aisle, extra_legroom, price_modifier)
      VALUES (
        p_flight_id,
        v_row || v_col,
        'business',
        v_row,
        v_col,
        v_col IN ('A', 'F'),
        v_col IN ('C', 'D'),
        TRUE,
        25.00
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  FOR v_row IN (v_first_rows + v_business_rows + 1)..(v_first_rows + v_business_rows + GREATEST(v_economy_rows, 0)) LOOP
    FOREACH v_col IN ARRAY v_seat_columns LOOP
      INSERT INTO seats (flight_id, seat_number, seat_class, seat_row, seat_column, is_window, is_aisle, is_emergency_exit, extra_legroom, price_modifier)
      VALUES (
        p_flight_id,
        v_row || v_col,
        'economy',
        v_row,
        v_col,
        v_col IN ('A', 'F'),
        v_col IN ('C', 'D'),
        v_row IN (v_first_rows + v_business_rows + 10, v_first_rows + v_business_rows + 11),
        v_row = (v_first_rows + v_business_rows + 1),
        CASE
          WHEN v_row = (v_first_rows + v_business_rows + 1) THEN 15.00
          WHEN v_row IN (v_first_rows + v_business_rows + 10, v_first_rows + v_business_rows + 11) THEN 20.00
          ELSE 0.00
        END
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  UPDATE seats
  SET status = 'occupied'
  WHERE flight_id = p_flight_id
  AND id IN (
    SELECT id FROM seats WHERE flight_id = p_flight_id ORDER BY RANDOM() LIMIT 20
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', null)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS update_flights_updated_at ON flights;
CREATE TRIGGER update_flights_updated_at
  BEFORE UPDATE ON flights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS prevent_late_cancellation ON bookings;
CREATE TRIGGER prevent_late_cancellation
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_cancellation_time();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION public.reserve_seat(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_booking(uuid) TO authenticated;
