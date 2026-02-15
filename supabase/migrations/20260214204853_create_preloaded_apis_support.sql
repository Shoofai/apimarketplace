-- Platform organization for preloaded/unclaimed APIs
INSERT INTO organizations (id, name, slug, type, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'API Directory',
  'platform-directory',
  'provider',
  'Preloaded API listings available for providers to claim and publish',
  now(),
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- Add claim-related columns to apis
ALTER TABLE apis
  ADD COLUMN IF NOT EXISTS claimed_by_organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS claim_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS original_url text;

-- Index for claim queue queries
CREATE INDEX IF NOT EXISTS idx_apis_status_unclaimed ON apis(status) WHERE status IN ('unclaimed', 'claim_pending');
