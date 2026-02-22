-- Enable pg_trgm for fast ILIKE search on apis table
-- Speeds up marketplace search by name, description, short_description

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indexes for ILIKE '%pattern%' (substring) search
-- Only index published/public APIs to reduce size and improve relevance
CREATE INDEX IF NOT EXISTS idx_apis_name_trgm
  ON apis USING gin (name gin_trgm_ops)
  WHERE status IN ('published', 'unclaimed') AND visibility = 'public';

CREATE INDEX IF NOT EXISTS idx_apis_short_description_trgm
  ON apis USING gin (short_description gin_trgm_ops)
  WHERE status IN ('published', 'unclaimed') AND visibility = 'public';

CREATE INDEX IF NOT EXISTS idx_apis_description_trgm
  ON apis USING gin (description gin_trgm_ops)
  WHERE status IN ('published', 'unclaimed') AND visibility = 'public';
