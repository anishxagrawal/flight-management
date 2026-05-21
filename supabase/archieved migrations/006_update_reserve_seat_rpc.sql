-- Update reserve_seat RPC to work with status field instead of is_available
-- This function permanently marks seats as occupied (final reservation)

CREATE OR REPLACE FUNCTION reserve_seat(
  p_seat_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_seat_status TEXT;
  v_selected_by UUID;
  v_flight_id UUID;
BEGIN
  -- Lock the seat row for update to prevent concurrent reservations
  SELECT status, selected_by, flight_id
  INTO v_seat_status, v_selected_by, v_flight_id
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

  -- Check if seat is already occupied
  IF v_seat_status = 'occupied' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Seat is already occupied'
    );
  END IF;

  -- Check if seat is selected by a different user
  IF v_seat_status = 'selected' AND v_selected_by != p_user_id THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Seat is held by another user'
    );
  END IF;

  -- Mark seat as permanently occupied
  UPDATE seats
  SET status = 'occupied',
      selected_by = p_user_id,
      selected_at = NOW(),
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