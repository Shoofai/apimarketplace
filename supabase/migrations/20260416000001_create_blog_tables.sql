-- Blog categories
CREATE TABLE blog_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO blog_categories (name, slug, description) VALUES
  ('Announcements',    'announcements',    'Product launches, company news, and platform updates'),
  ('Tutorials',        'tutorials',        'Step-by-step guides and how-tos'),
  ('Case Studies',     'case-studies',     'Real-world customer stories and results'),
  ('Engineering',      'engineering',      'Deep dives into how we build the platform'),
  ('API Economy',      'api-economy',      'Trends, analysis, and commentary on the API ecosystem'),
  ('Developer Tips',   'developer-tips',   'Practical advice for API developers and integrators'),
  ('Provider Guides',  'provider-guides',  'Resources for API providers and monetization'),
  ('Company',          'company',          'Culture, hiring, and company updates');

-- Blog posts
CREATE TABLE blog_posts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL,
  slug                  text NOT NULL UNIQUE,
  excerpt               text,
  content               text,
  featured_image_url    text,
  status                text NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'published', 'archived')),
  published_at          timestamptz,
  featured              boolean NOT NULL DEFAULT false,
  view_count            integer NOT NULL DEFAULT 0,
  reading_time_minutes  integer,
  category_id           uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_id             uuid REFERENCES users(id) ON DELETE SET NULL,
  author_name           text,
  tags                  text[] NOT NULL DEFAULT '{}',
  meta_title            text,
  meta_description      text,
  canonical_url         text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION blog_posts_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION blog_posts_set_updated_at();

CREATE INDEX blog_posts_status_published_at ON blog_posts (status, published_at DESC NULLS LAST);
CREATE INDEX blog_posts_category_id         ON blog_posts (category_id);
CREATE INDEX blog_posts_slug                ON blog_posts (slug);
CREATE INDEX blog_posts_tags                ON blog_posts USING gin (tags);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read categories"       ON blog_categories FOR SELECT USING (true);
CREATE POLICY "public read published posts"  ON blog_posts      FOR SELECT USING (status = 'published');
CREATE POLICY "service role full access categories" ON blog_categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service role full access posts"      ON blog_posts      FOR ALL USING (auth.role() = 'service_role');
