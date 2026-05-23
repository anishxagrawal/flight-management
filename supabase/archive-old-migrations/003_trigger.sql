-- Function to check cancellation time before update
CREATE OR REPLACE FUNCTION check_cancellation_time()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_departs_at TIMESTAMPTZ;
  v_hours_until_departure NUMERIC;
BEGIN
  -- Only check if status is being changed to 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    -- Get flight departure time
    SELECT departs_at INTO v_departs_at
    FROM flights
    WHERE id = NEW.flight_id;

    -- Calculate hours until departure
    v_hours_until_departure := EXTRACT(EPOCH FROM (v_departs_at - NOW())) / 3600;

    -- Raise exception if within 2 hours
    IF v_hours_until_departure < 2 THEN
      RAISE EXCEPTION 'Cannot cancel within 2 hours of departure';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on bookings table
CREATE TRIGGER prevent_late_cancellation
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_cancellation_time();

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at on relevant tables
CREATE TRIGGER update_flights_updated_at
  BEFORE UPDATE ON flights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
