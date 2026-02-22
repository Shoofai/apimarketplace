-- Enable pg_trgm for fast ILIKE search on apis table
-- Speeds up marketplace search by name, description, short_description

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indexes for ILIKE '%pattern%' (substring) search
-- Only index published/public APIs to reduce size and improve relevance
CREATE INDEX IF NOT EXISTS idx_apis_name_trgm
  ON apis USING gin (name gin_trgm_ops)
  WHERE status IN ('published', 'unclaimed') AND visibility = 'public';

-- Only create if column exists (remote schema may not have short_description)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'apis' AND column_name = 'short_description') THEN
    CREATE INDEX IF NOT EXISTS idx_apis_short_description_trgm
      ON apis USING gin (short_description gin_trgm_ops)
      WHERE status IN ('published', 'unclaimed') AND visibility = 'public';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_apis_description_trgm
  ON apis USING gin (description gin_trgm_ops)
  WHERE status IN ('published', 'unclaimed') AND visibility = 'public';
