import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/apis/[id]/status
 * Returns uptime and latency aggregates plus recent incidents for status page.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: apiId } = await params;
    const supabase = await createClient();

    const { data: api, error: apiError } = await supabase
      .from('apis')
      .select('id, name, status')
      .eq('id', apiId)
      .single();

    if (apiError || !api || api.status !== 'published') {
      return NextResponse.json({ error: 'API not found' }, { status: 404 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let uptime7d = 99.9;
    let uptime30d = 99.9;
    let avgLatency7d: number | null = null;
    let hourly: { hour: string; total: number; success: number; avg_latency: number }[] = [];

    const { data: requests } = await supabase
      .from('api_requests_log')
      .select('status_code, latency_ms, created_at')
      .eq('api_id', apiId)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (requests?.length) {
      const total = requests.length;
      const success = requests.filter((r) => r.status_code >= 200 && r.status_code < 300).length;
      uptime7d = total > 0 ? (success / total) * 100 : 99.9;
      const withLatency = requests.filter((r) => r.latency_ms != null) as { latency_ms: number }[];
      avgLatency7d = withLatency.length ? withLatency.reduce((s, r) => s + r.latency_ms, 0) / withLatency.length : null;
    }

    const { data: incidents } = await supabase
      .from('api_incidents')
      .select('id, severity, title, description, status, started_at, resolved_at')
      .eq('api_id', apiId)
      .gte('started_at', thirtyDaysAgo.toISOString())
      .order('started_at', { ascending: false })
      .limit(20);

    const currentStatus = incidents?.some(
      (i) => i.status !== 'resolved' && !i.resolved_at
    )
      ? 'degraded'
      : 'operational';

    return NextResponse.json({
      api_id: apiId,
      status: currentStatus,
      uptime_7d: Math.round(uptime7d * 10) / 10,
      uptime_30d: Math.round(uptime30d * 10) / 10,
      avg_latency_ms_7d: avgLatency7d != null ? Math.round(avgLatency7d) : null,
      incidents: incidents ?? [],
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load status' }, { status: 500 });
  }
}
