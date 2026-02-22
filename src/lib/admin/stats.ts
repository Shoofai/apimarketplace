import { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

export type AdminKpis = {
  gmv: { total: number; last30d: number };
  platformRevenue: { last30d: number };
  activeApis: number;
  activeSubscriptions: number;
  totalUsers: number;
  activeUsers: { daily: number; weekly: number; monthly: number };
  totalOrgs: number;
  apiCalls: { last24h: number };
};

/**
 * Fetch platform-wide KPIs for admin dashboard.
 * Use from server context (same request as auth) so Supabase uses the user's session.
 */
export async function getAdminKpis(supabase: SupabaseClient): Promise<{ kpis: AdminKpis }> {
  const [
    { count: totalApis },
    { count: activeApis },
    { count: totalUsers },
    { count: totalOrgs },
    { count: activeSubscriptions },
    { data: revenueData },
    { count: apiCallsCount },
  ] = await Promise.all([
    supabase.from('apis').select('*', { count: 'exact', head: true }),
    supabase.from('apis').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase
      .from('api_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('invoices')
      .select('total_amount, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .eq('status', 'paid'),
    supabase
      .from('api_requests_log')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const gmv = revenueData?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
  const platformRevenue = gmv * 0.03;

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const { data: activeUserData } = await supabase
    .from('users')
    .select('last_active_at')
    .not('last_active_at', 'is', null)
    .limit(DEFAULT_LIST_LIMIT);

  const activeUsers = {
    daily: activeUserData?.filter((u) => new Date(u.last_active_at!).getTime() > now - day).length ?? 0,
    weekly: activeUserData?.filter((u) => new Date(u.last_active_at!).getTime() > now - 7 * day).length ?? 0,
    monthly: activeUserData?.filter((u) => new Date(u.last_active_at!).getTime() > now - 30 * day).length ?? 0,
  };

  return {
    kpis: {
      gmv: { total: gmv, last30d: gmv },
      platformRevenue: { last30d: platformRevenue },
      activeApis: activeApis ?? 0,
      activeSubscriptions: activeSubscriptions ?? 0,
      totalUsers: totalUsers ?? 0,
      activeUsers,
      totalOrgs: totalOrgs ?? 0,
      apiCalls: { last24h: apiCallsCount ?? 0 },
    },
  };
}
