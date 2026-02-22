import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/admin';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

/**
 * GET /api/admin/stats
 * Platform-wide KPI statistics for admin dashboard
 */
export async function GET() {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();

    // Parallel data fetching for performance
    const [
      { count: totalApis },
      { count: activeApis },
      { count: totalUsers },
      { count: totalOrgs },
      { count: activeSubscriptions },
      { data: revenueData },
      { count: apiCallsCount },
    ] = await Promise.all([
      // Total APIs
      supabase.from('apis').select('*', { count: 'exact', head: true }),

      // Active (published) APIs
      supabase.from('apis').select('*', { count: 'exact', head: true }).eq('status', 'published'),

      // Total users
      supabase.from('users').select('*', { count: 'exact', head: true }),

      // Total organizations
      supabase.from('organizations').select('*', { count: 'exact', head: true }),

      // Active subscriptions
      supabase
        .from('api_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),

      // Revenue data (last 30 days)
      supabase
        .from('invoices')
        .select('total_amount, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .eq('status', 'paid'),

      // API calls (last 24 hours)
      supabase
        .from('api_requests_log')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ]);

    // Calculate GMV and platform revenue
    const gmv = revenueData?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
    const platformRevenue = gmv * 0.03; // 3% platform fee

    // Get user activity counts (last 24h, 7d, 30d)
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const { data: activeUserData } = await supabase
      .from('users')
      .select('last_active_at')
      .not('last_active_at', 'is', null)
      .limit(DEFAULT_LIST_LIMIT);

    const activeUsers = {
      daily: activeUserData?.filter((u) => new Date(u.last_active_at!).getTime() > now - day)
        .length,
      weekly: activeUserData?.filter((u) => new Date(u.last_active_at!).getTime() > now - 7 * day)
        .length,
      monthly: activeUserData?.filter(
        (u) => new Date(u.last_active_at!).getTime() > now - 30 * day
      ).length,
    };

    return NextResponse.json({
      kpis: {
        gmv: { total: gmv, last30d: gmv },
        platformRevenue: { last30d: platformRevenue },
        activeApis: activeApis || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalUsers: totalUsers || 0,
        activeUsers,
        totalOrgs: totalOrgs || 0,
        apiCalls: {
          last24h: apiCallsCount ?? 0,
        },
      },
    });
  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
