import type { SupabaseClient } from '@supabase/supabase-js';

export type SecurityMetrics = {
  audit: {
    last24h: { total: number; failed: number; byAction: Record<string, number> };
    last7d: { total: number; failed: number };
    last30d: { total: number; failed: number };
    recent: Array<{ id: string; action: string; resource_type: string; status: string; created_at: string }>;
  };
  securityEvents: {
    last24h: number;
    last7d: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recent: Array<{
      id: string;
      event_type: string;
      severity: string;
      ip_address: string | null;
      created_at: string;
    }>;
  };
  rateLimitViolations: {
    last24h: number;
    last7d: number;
    byEndpoint: Record<string, number>;
    recent: Array<{ id: string; endpoint: string; ip_address: string | null; created_at: string }>;
  };
};

const toIso = (ms: number) => new Date(Date.now() - ms).toISOString();

/**
 * Collect security metrics for the admin dashboard.
 * Uses admin client to read audit_logs, security_events, rate_limit_violations.
 */
export async function getSecurityMetrics(
  supabase: SupabaseClient
): Promise<SecurityMetrics> {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const iso24 = toIso(day);
  const iso7d = toIso(7 * day);
  const iso30d = toIso(30 * day);

  const [auditResult, securityEventsResult, rateLimitResult] = await Promise.all([
    fetchAuditMetrics(supabase, iso24, iso7d, iso30d),
    fetchSecurityEventsMetrics(supabase, iso24, iso7d),
    fetchRateLimitMetrics(supabase, iso24, iso7d),
  ]);

  return {
    audit: auditResult,
    securityEvents: securityEventsResult,
    rateLimitViolations: rateLimitResult,
  };
}

async function fetchAuditMetrics(
  supabase: SupabaseClient,
  iso24: string,
  iso7d: string,
  iso30d: string
): Promise<SecurityMetrics['audit']> {
  const [res24, res7d, res30d, recent] = await Promise.all([
    supabase
      .from('audit_logs')
      .select('id, action, status')
      .gte('created_at', iso24),
    supabase
      .from('audit_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', iso7d),
    supabase
      .from('audit_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', iso30d),
    supabase
      .from('audit_logs')
      .select('id, action, resource_type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const logs24 = res24.data ?? [];
  const byAction: Record<string, number> = {};
  let failed24 = 0;
  for (const row of logs24) {
    byAction[row.action] = (byAction[row.action] ?? 0) + 1;
    if (row.status === 'failed' || row.status === 'error') failed24++;
  }

  const [failed7dRes, failed30dRes] = await Promise.all([
    supabase
      .from('audit_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', iso7d)
      .in('status', ['failed', 'error']),
    supabase
      .from('audit_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', iso30d)
      .in('status', ['failed', 'error']),
  ]);
  const failed7d = failed7dRes.count ?? 0;
  const failed30d = failed30dRes.count ?? 0;

  return {
    last24h: { total: logs24.length, failed: failed24, byAction },
    last7d: { total: res7d.count ?? 0, failed: failed7d },
    last30d: { total: res30d.count ?? 0, failed: failed30d },
    recent: (recent.data ?? []).map((r) => ({
      id: r.id,
      action: r.action,
      resource_type: r.resource_type,
      status: r.status,
      created_at: r.created_at,
    })),
  };
}

async function fetchSecurityEventsMetrics(
  supabase: SupabaseClient,
  iso24: string,
  iso7d: string
): Promise<SecurityMetrics['securityEvents']> {
  let data24: Array<{ event_type: string; severity: string; ip_address: string | null; created_at: string; id: string }> = [];
  let count7d = 0;
  let recent: Array<{ id: string; event_type: string; severity: string; ip_address: string | null; created_at: string }> = [];

  try {
    const [res24, res7d, resRecent] = await Promise.all([
      supabase
        .from('security_events')
        .select('id, event_type, severity, ip_address, created_at')
        .gte('created_at', iso24),
      supabase
        .from('security_events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', iso7d),
      supabase
        .from('security_events')
        .select('id, event_type, severity, ip_address, created_at')
        .order('created_at', { ascending: false })
        .limit(20),
    ]);
    data24 = (res24.data ?? []) as typeof data24;
    count7d = res7d.count ?? 0;
    recent = (resRecent.data ?? []) as typeof recent;
  } catch {
    // Table may not exist yet or RLS; return empty
  }

  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  for (const row of data24) {
    byType[row.event_type] = (byType[row.event_type] ?? 0) + 1;
    bySeverity[row.severity] = (bySeverity[row.severity] ?? 0) + 1;
  }

  return {
    last24h: data24.length,
    last7d: count7d,
    byType,
    bySeverity,
    recent,
  };
}

async function fetchRateLimitMetrics(
  supabase: SupabaseClient,
  iso24: string,
  iso7d: string
): Promise<SecurityMetrics['rateLimitViolations']> {
  let data24: Array<{ endpoint: string; ip_address: string | null; created_at: string; id: string }> = [];
  let count7d = 0;
  let recent: Array<{ id: string; endpoint: string; ip_address: string | null; created_at: string }> = [];

  try {
    const [res24, res7d, resRecent] = await Promise.all([
      supabase
        .from('rate_limit_violations')
        .select('id, endpoint, ip_address, created_at')
        .gte('created_at', iso24),
      supabase
        .from('rate_limit_violations')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', iso7d),
      supabase
        .from('rate_limit_violations')
        .select('id, endpoint, ip_address, created_at')
        .order('created_at', { ascending: false })
        .limit(20),
    ]);
    data24 = (res24.data ?? []) as typeof data24;
    count7d = res7d.count ?? 0;
    recent = (resRecent.data ?? []) as typeof recent;
  } catch {
    // Table may not exist yet
  }

  const byEndpoint: Record<string, number> = {};
  for (const row of data24) {
    byEndpoint[row.endpoint] = (byEndpoint[row.endpoint] ?? 0) + 1;
  }

  return {
    last24h: data24.length,
    last7d: count7d,
    byEndpoint,
    recent,
  };
}
