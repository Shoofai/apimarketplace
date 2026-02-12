-- Create materialized view for platform KPIs
CREATE MATERIALIZED VIEW IF NOT EXISTS platform_kpis AS
SELECT
  (SELECT COUNT(*) FROM apis WHERE status = 'published') as active_apis,
  (SELECT COUNT(*) FROM api_subscriptions WHERE status = 'active') as active_subscriptions,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM organizations) as total_organizations,
  (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status = 'paid' AND created_at > NOW() - INTERVAL '30 days') as revenue_30d,
  NOW() as last_updated;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS platform_kpis_last_updated_idx ON platform_kpis(last_updated);

-- Create function to refresh the view
CREATE OR REPLACE FUNCTION refresh_platform_kpis()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY platform_kpis;
END;
$$;

-- Create materialized view for API rankings
CREATE MATERIALIZED VIEW IF NOT EXISTS api_rankings_mv AS
SELECT
  a.id,
  a.name,
  a.slug,
  a.organization_id,
  o.name as org_name,
  o.slug as org_slug,
  COUNT(DISTINCT s.id) as subscriber_count,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COUNT(DISTINCT r.id) as review_count,
  COALESCE(SUM(ur.total_calls), 0) as total_requests,
  a.created_at,
  NOW() as last_updated
FROM apis a
LEFT JOIN organizations o ON a.organization_id = o.id
LEFT JOIN api_subscriptions s ON a.id = s.api_id AND s.status = 'active'
LEFT JOIN api_reviews r ON a.id = r.api_id
LEFT JOIN usage_records_daily ur ON a.id = ur.api_id AND ur.day > NOW() - INTERVAL '30 days'
WHERE a.status = 'published'
GROUP BY a.id, o.name, o.slug;

-- Create indexes on rankings
CREATE UNIQUE INDEX IF NOT EXISTS api_rankings_id_idx ON api_rankings_mv(id);
CREATE INDEX IF NOT EXISTS api_rankings_subscriber_count_idx ON api_rankings_mv(subscriber_count DESC);
CREATE INDEX IF NOT EXISTS api_rankings_avg_rating_idx ON api_rankings_mv(avg_rating DESC);

-- Create function to refresh rankings
CREATE OR REPLACE FUNCTION refresh_api_rankings()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY api_rankings_mv;
END;
$$;

-- Add performance tracking indexes
CREATE INDEX IF NOT EXISTS idx_api_requests_log_created_at ON api_requests_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_requests_log_api_subscription ON api_requests_log(api_id, subscription_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_records_daily_date ON usage_records_daily(day DESC, api_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status_created ON invoices(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_apis_status_category ON apis(status, category_id) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_api_subscriptions_org_status ON api_subscriptions(organization_id, status, created_at DESC);

COMMENT ON MATERIALIZED VIEW platform_kpis IS 'Cached platform KPIs refreshed hourly';
COMMENT ON MATERIALIZED VIEW api_rankings_mv IS 'Cached API rankings refreshed daily';
