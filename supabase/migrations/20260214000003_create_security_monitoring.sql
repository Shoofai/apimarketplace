-- Security and performance monitoring tables for admin dashboards

-- Security events: failed logins, permission denials, API key attempts, etc.
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);

ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can read security_events"
  ON security_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_platform_admin = true
    )
  );

-- Service role / app can insert (no INSERT policy for anon/authenticated; use service role for writes)


-- Performance metrics: aggregated latency and throughput per endpoint
CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  endpoint text,
  p50_ms numeric,
  p95_ms numeric,
  p99_ms numeric,
  count bigint DEFAULT 0,
  error_count bigint DEFAULT 0,
  timestamp timestamptz NOT NULL DEFAULT date_trunc('hour', now())
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_endpoint ON performance_metrics(endpoint);

ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can read performance_metrics"
  ON performance_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_platform_admin = true
    )
  );


-- Rate limit violations: track when rate limits are hit
CREATE TABLE IF NOT EXISTS rate_limit_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  endpoint text NOT NULL,
  limit_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_created_at ON rate_limit_violations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_ip_address ON rate_limit_violations(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_endpoint ON rate_limit_violations(endpoint);

ALTER TABLE rate_limit_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can read rate_limit_violations"
  ON rate_limit_violations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_platform_admin = true
    )
  );
