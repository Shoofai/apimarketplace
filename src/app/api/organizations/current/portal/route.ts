import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/organizations/current/portal
 * Returns portal settings for the current org.
 */
export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const { data } = await supabase
      .from('organizations')
      .select('portal_enabled, portal_settings, custom_domain')
      .eq('id', context.organization_id)
      .single();
    return NextResponse.json(data ?? {});
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PUT /api/organizations/current/portal
 * Update portal settings. Only org owner/admin.
 */
export async function PUT(req: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const body = await req.json();

    const { portal_enabled, portal_settings, custom_domain } = body;

    await supabase
      .from('organizations')
      .update({
        portal_enabled: portal_enabled ?? false,
        portal_settings: portal_settings ?? {},
        custom_domain: custom_domain || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', context.organization_id);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
