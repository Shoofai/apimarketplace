-- Optimize search_marketplace_apis: compute min/max price via LATERAL join
-- instead of two correlated subqueries per row. Same signature and return shape.

CREATE OR REPLACE FUNCTION search_marketplace_apis(
  p_query text DEFAULT NULL,
  p_category_id uuid DEFAULT NULL,
  p_min_rating float DEFAULT NULL,
  p_free_only boolean DEFAULT FALSE,
  p_tags text[] DEFAULT NULL,
  p_price_min numeric DEFAULT NULL,
  p_price_max numeric DEFAULT NULL,
  p_sort text DEFAULT 'popular',
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE(data jsonb, total bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_escaped_query text;
  v_pattern text;
BEGIN
  IF p_query IS NOT NULL AND trim(p_query) <> '' THEN
    v_escaped_query := trim(p_query);
    v_escaped_query := replace(v_escaped_query, '\', '\\');
    v_escaped_query := replace(v_escaped_query, '%', '\%');
    v_escaped_query := replace(v_escaped_query, '_', '\_');
    v_pattern := '%' || v_escaped_query || '%';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT
      a.id,
      a.name,
      a.slug,
      a.description,
      a.short_description,
      a.base_url,
      a.logo_url,
      a.status,
      a.visibility,
      a.organization_id,
      a.category_id,
      a.avg_rating,
      a.total_reviews,
      a.total_subscribers,
      a.published_at,
      a.created_at,
      a.updated_at,
      a.tags,
      a.settings,
      a.long_description,
      a.openapi_raw,
      a.openapi_spec,
      a.gateway_service_id,
      a.claimed_by_organization_id,
      a.claimed_at,
      a.claim_requested_at,
      a.original_url,
      a.total_api_calls,
      o.name AS org_name,
      o.slug AS org_slug,
      o.logo_url AS org_logo_url,
      c.name AS cat_name,
      c.slug AS cat_slug,
      pr.min_price AS min_price,
      pr.max_price AS max_price
    FROM apis a
    LEFT JOIN organizations o ON o.id = a.organization_id
    LEFT JOIN api_categories c ON c.id = a.category_id
    LEFT JOIN LATERAL (
      SELECT
        MIN(pp.price_monthly) AS min_price,
        MAX(pp.price_monthly) AS max_price
      FROM api_pricing_plans pp
      WHERE pp.api_id = a.id
    ) pr ON true
    WHERE a.status IN ('published', 'unclaimed')
      AND a.visibility = 'public'
      AND (v_pattern IS NULL OR a.name ILIKE v_pattern OR a.description ILIKE v_pattern OR a.short_description ILIKE v_pattern
           OR EXISTS (SELECT 1 FROM unnest(COALESCE(a.tags, ARRAY[]::text[])) t WHERE t ILIKE v_pattern))
      AND (p_category_id IS NULL OR a.category_id = p_category_id)
      AND (p_min_rating IS NULL OR (a.avg_rating IS NOT NULL AND a.avg_rating >= p_min_rating))
      AND (NOT p_free_only OR EXISTS (SELECT 1 FROM api_pricing_plans pp WHERE pp.api_id = a.id AND pp.price_monthly = 0))
      AND (p_tags IS NULL OR array_length(p_tags, 1) IS NULL OR a.tags @> p_tags)
      AND (p_price_min IS NULL OR EXISTS (SELECT 1 FROM api_pricing_plans pp WHERE pp.api_id = a.id AND pp.price_monthly >= p_price_min))
      AND (p_price_max IS NULL OR EXISTS (SELECT 1 FROM api_pricing_plans pp WHERE pp.api_id = a.id AND pp.price_monthly <= p_price_max))
  ),
  total_cte AS (SELECT count(*)::bigint AS t FROM base),
  ordered AS (
    SELECT * FROM base
    ORDER BY
      CASE WHEN p_sort = 'popular' THEN (total_subscribers::bigint) END DESC NULLS LAST,
      CASE WHEN p_sort = 'rating' THEN avg_rating END DESC NULLS LAST,
      CASE WHEN p_sort = 'rating' THEN (total_reviews::bigint) END DESC NULLS LAST,
      CASE WHEN p_sort = 'newest' THEN published_at END DESC NULLS LAST,
      CASE WHEN p_sort = 'price_asc' THEN min_price END ASC NULLS LAST,
      CASE WHEN p_sort = 'price_desc' THEN max_price END DESC NULLS LAST,
      created_at DESC NULLS LAST
  ),
  paged AS (
    SELECT COALESCE(jsonb_agg(row_to_json(ordered.*)), '[]'::jsonb) AS agg
    FROM (SELECT * FROM ordered LIMIT p_limit OFFSET p_offset) ordered
  )
  SELECT paged.agg, total_cte.t
  FROM paged, total_cte;
END;
$$;
