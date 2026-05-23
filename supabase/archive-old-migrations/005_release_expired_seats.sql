-- Function to automatically release seats that were selected but booking never completed
-- This prevents seats from being held indefinitely if users abandon the booking process

CREATE OR REPLACE FUNCTION release_expired_seat_holds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Release seats that have been selected for more than 10 minutes
  UPDATE seats
  SET status = 'available', 
      selected_by = null, 
      selected_at = null
  WHERE status = 'selected'
    AND selected_at < now() - interval '10 minutes';
    
  -- Log how many seats were released (optional)
  RAISE NOTICE 'Released % expired seat holds', ROW_COUNT;
END;
$$;

-- Grant execute permission to authenticated users (for manual cleanup if needed)
GRANT EXECUTE ON FUNCTION release_expired_seat_holds() TO authenticated;

-- Optional: Create a scheduled job to run this function every 5 minutes
-- Note: This requires pg_cron extension which may not be available in all Supabase plans
-- You can run this manually or set up a cron job externally

-- Example of how to call this function manually:
-- SELECT release_expired_seat_holds();