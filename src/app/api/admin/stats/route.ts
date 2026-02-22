// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/admin';
import { getAdminKpis } from '@/lib/admin/stats';

/**
 * GET /api/admin/stats
 * Platform-wide KPI statistics for admin dashboard
 */
export async function GET() {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();
    const result = await getAdminKpis(supabase);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
