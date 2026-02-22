-- API favorites / bookmarks
CREATE TABLE IF NOT EXISTS api_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_id uuid NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, api_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON api_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_api ON api_favorites(api_id);

ALTER TABLE api_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own favorites" ON api_favorites;
CREATE POLICY "Users can manage their own favorites"
  ON api_favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
