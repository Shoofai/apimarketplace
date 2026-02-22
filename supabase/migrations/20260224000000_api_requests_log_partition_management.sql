-- api_requests_log is already range-partitioned by created_at (monthly).
-- This migration adds a function to create the next month's partition if missing
-- (for ongoing partition management). Retention/drop is in 20260224000001.

CREATE OR REPLACE FUNCTION ensure_api_requests_log_partition()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start date := date_trunc('month', (CURRENT_DATE + interval '1 month'))::date;
  v_end date := v_start + interval '1 month';
  v_name text := 'api_requests_log_' || to_char(v_start, 'YYYY_MM');
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_inherits i ON i.inhrelid = c.oid
    WHERE c.relname = v_name AND i.inhparent = 'api_requests_log'::regclass
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF api_requests_log FOR VALUES FROM (%L) TO (%L)',
      v_name,
      v_start,
      v_end
    );
  END IF;
END;
$$;

COMMENT ON FUNCTION ensure_api_requests_log_partition() IS 'Creates next month partition for api_requests_log if missing. Call from cron or after deploy.';
