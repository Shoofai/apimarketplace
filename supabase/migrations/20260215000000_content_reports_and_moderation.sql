-- Content reports table for forum posts and API reviews
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('forum_topic', 'forum_post', 'api_review')),
  resource_id uuid NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'action_taken')),
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text
);

CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_resource ON content_reports(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_created ON content_reports(created_at DESC);

-- Allow hiding forum_posts and api_reviews (soft delete for moderation)
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS hidden_at timestamptz;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS hidden_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE api_reviews ADD COLUMN IF NOT EXISTS hidden_at timestamptz;
ALTER TABLE api_reviews ADD COLUMN IF NOT EXISTS hidden_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON TABLE content_reports IS 'User reports for forum and review content; used for moderation queue';
