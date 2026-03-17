-- Add upvote tracking to forum topics and posts
ALTER TABLE forum_topics ADD COLUMN IF NOT EXISTS upvote_count integer NOT NULL DEFAULT 0;
ALTER TABLE forum_topics ADD COLUMN IF NOT EXISTS post_count integer NOT NULL DEFAULT 0;
ALTER TABLE forum_topics ADD COLUMN IF NOT EXISTS body text;

-- Forum votes (topic-level upvotes)
CREATE TABLE IF NOT EXISTS forum_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, topic_id)
);

ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can vote" ON forum_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can remove own vote" ON forum_votes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "authenticated users can read votes" ON forum_votes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Function to maintain upvote_count on forum_topics
CREATE OR REPLACE FUNCTION update_topic_upvote_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_topics SET upvote_count = upvote_count + 1 WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_topics SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_topic_upvote_count ON forum_votes;
CREATE TRIGGER trg_topic_upvote_count
  AFTER INSERT OR DELETE ON forum_votes
  FOR EACH ROW EXECUTE FUNCTION update_topic_upvote_count();

-- Function to maintain post_count on forum_topics
CREATE OR REPLACE FUNCTION update_topic_post_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_topics SET post_count = post_count + 1, updated_at = now() WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_topics SET post_count = GREATEST(post_count - 1, 0) WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_topic_post_count ON forum_posts;
CREATE TRIGGER trg_topic_post_count
  AFTER INSERT OR DELETE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_topic_post_count();

CREATE INDEX IF NOT EXISTS idx_forum_votes_topic ON forum_votes(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_user ON forum_votes(user_id);
