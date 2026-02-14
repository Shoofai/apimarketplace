import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePlatformAdmin } from '@/lib/auth/admin';
import { getPerformanceMetrics } from '@/lib/monitoring/performance';

/**
 * GET /api/admin/performance/metrics
 * Returns performance dashboard metrics (platform admin only).
 */
export async function GET() {
  try {
    await requirePlatformAdmin();
    const supabase = createAdminClient();
    const metrics = await getPerformanceMetrics(supabase);
    return NextResponse.json(metrics);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
