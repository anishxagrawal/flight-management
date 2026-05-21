-- RPC function to reserve a seat (thread-safe with row locking)
CREATE OR REPLACE FUNCTION reserve_seat(
  p_seat_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_seat_available BOOLEAN;
  v_flight_id UUID;
BEGIN
  -- Lock the seat row for update to prevent concurrent reservations
  SELECT is_available, flight_id
  INTO v_seat_available, v_flight_id
  FROM seats
  WHERE id = p_seat_id
  FOR UPDATE;

  -- Check if seat exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Seat not found'
    );
  END IF;

  -- Check if seat is available
  IF NOT v_seat_available THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Seat is already reserved'
    );
  END IF;

  -- Mark seat as unavailable
  UPDATE seats
  SET is_available = false,
      updated_at = NOW()
  WHERE id = p_seat_id;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Seat reserved successfully',
    'seat_id', p_seat_id,
    'flight_id', v_flight_id
  );
END;
$$;

-- RPC function to cancel a booking (with 2-hour check)
CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_flight_id UUID;
  v_seat_id UUID;
  v_departs_at TIMESTAMPTZ;
  v_hours_until_departure NUMERIC;
BEGIN
  -- Get booking details with row lock
  SELECT b.user_id, b.flight_id, b.seat_id, f.departs_at
  INTO v_user_id, v_flight_id, v_seat_id, v_departs_at
  FROM bookings b
  JOIN flights f ON f.id = b.flight_id
  WHERE b.id = p_booking_id
  FOR UPDATE OF b;

  -- Check if booking exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Booking not found'
    );
  END IF;

  -- Check if user owns this booking
  IF v_user_id != auth.uid() THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Unauthorized'
    );
  END IF;

  -- Calculate hours until departure
  v_hours_until_departure := EXTRACT(EPOCH FROM (v_departs_at - NOW())) / 3600;

  -- Check if departure is within 2 hours
  IF v_hours_until_departure < 2 THEN
    RAISE EXCEPTION 'Cannot cancel within 2 hours of departure';
  END IF;

  -- Update booking status to cancelled
  UPDATE bookings
  SET status = 'cancelled',
      updated_at = NOW()
  WHERE id = p_booking_id;

  -- Mark seat as available again
  UPDATE seats
  SET is_available = true,
      updated_at = NOW()
  WHERE id = v_seat_id;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Booking cancelled successfully',
    'booking_id', p_booking_id
  );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION reserve_seat(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_booking(UUID) TO authenticated;
