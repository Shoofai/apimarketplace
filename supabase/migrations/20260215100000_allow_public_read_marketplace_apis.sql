-- Allow anyone (including anon) to read APIs that are in the public marketplace.
-- Without this, RLS can restrict SELECT to only APIs from the user's organizations,
-- hiding preloaded/unclaimed APIs under the platform-directory org.
-- Marketplace query in app already filters by visibility = 'public' AND status IN ('published', 'unclaimed').

ALTER TABLE public.apis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read marketplace APIs" ON public.apis;
CREATE POLICY "Public can read marketplace APIs"
ON public.apis
FOR SELECT
USING (
  visibility = 'public'
  AND status IN ('published', 'unclaimed')
);
