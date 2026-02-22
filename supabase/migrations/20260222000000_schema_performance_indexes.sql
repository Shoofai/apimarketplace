-- Schema performance indexes for marketplace, dashboard, and search.
-- Add indexes used by app queries and RLS. Use IF NOT EXISTS for idempotency.

-- apis: marketplace/docs lookup by slug and status; org-scoped slug
CREATE INDEX IF NOT EXISTS idx_apis_slug_status ON apis(slug, status);
CREATE INDEX IF NOT EXISTS idx_apis_organization_slug ON apis(organization_id, slug);

-- apis: GIN index for tag containment in search (tags @> p_tags)
CREATE INDEX IF NOT EXISTS idx_apis_tags_gin ON apis USING gin(tags) WHERE status IN ('published', 'unclaimed') AND visibility = 'public';

-- api_requests_log: dashboard/analytics by subscription and time
CREATE INDEX IF NOT EXISTS idx_api_requests_log_subscription_created ON api_requests_log(subscription_id, created_at DESC);

-- usage_records_daily: subscriptions page and usage aggregation
CREATE INDEX IF NOT EXISTS idx_usage_records_daily_subscription_day ON usage_records_daily(subscription_id, day DESC);

-- organization_members: RLS and useOrganization lookups
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_org ON organization_members(user_id, organization_id);

-- audit_logs: activity page
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);

-- support_tickets: admin tickets list
CREATE INDEX IF NOT EXISTS idx_support_tickets_status_created ON support_tickets(status, created_at DESC);

-- forum_posts: topic detail page
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic_created ON forum_posts(topic_id, created_at);

-- forum_topics: forum list
CREATE INDEX IF NOT EXISTS idx_forum_topics_updated ON forum_topics(updated_at DESC);

-- users: admin users list
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- api_pricing_plans: RPC search_marketplace_apis (FK may exist; ensure index for joins)
CREATE INDEX IF NOT EXISTS idx_api_pricing_plans_api_id ON api_pricing_plans(api_id);
