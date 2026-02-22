-- Drop api_requests_log partitions older than retention_months. Call from cron.
--
-- ROLLBACK/BACKUP PLAN (Production Readiness DB-4):
-- - This migration only creates a function; it does not run DROP at apply time.
-- - The function drop_old_api_requests_log_partitions() is invoked by cron
--   (/api/cron/process-retention). To roll back: revoke execute from cron or
--   drop the function: DROP FUNCTION IF EXISTS drop_old_api_requests_log_partitions(int);
-- - Partitions once dropped are not recoverable. Ensure backups (e.g. PITR) cover
--   api_requests_log* tables before running retention in production.
-- - In shared branches, prefer not to change this function; use a new migration
--   if behavior changes are required.

CREATE OR REPLACE FUNCTION drop_old_api_requests_log_partitions(retention_months int DEFAULT 12)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cutoff date := date_trunc('month', CURRENT_DATE - (retention_months || ' months')::interval)::date;
  r record;
  v_dropped int := 0;
BEGIN
  FOR r IN
    SELECT c.relname
    FROM pg_inherits i
    JOIN pg_class c ON c.oid = i.inhrelid
    WHERE i.inhparent = 'api_requests_log'::regclass
      AND c.relname ~ '^api_requests_log_\d{4}_\d{2}$'
  LOOP
    -- Parse YYYY_MM from partition name (api_requests_log_2026_02 -> 2026-02-01)
    BEGIN
      IF to_date(
        regexp_replace(r.relname, '^api_requests_log_(\d{4})_(\d{2})$', '\1-\2-01'),
        'YYYY-MM-DD'
      ) < v_cutoff THEN
        EXECUTE format('DROP TABLE IF EXISTS %I', r.relname);
        v_dropped := v_dropped + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Skip partitions that don't match naming
      NULL;
    END;
  END LOOP;
  RETURN v_dropped;
END;
$$;

COMMENT ON FUNCTION drop_old_api_requests_log_partitions(int) IS 'Drops monthly partitions of api_requests_log older than retention_months. Default 12. Call from cron.';
