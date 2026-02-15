import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { seedDemoData } from '@/lib/seed/demo-data';

const DEMO_MODE_KEY = 'demo_mode_enabled';

/**
 * GET /api/admin/demo
 * Returns current demo mode setting (admin only).
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: userData } = await admin
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: row } = await admin
    .from('app_settings')
    .select('value')
    .eq('key', DEMO_MODE_KEY)
    .maybeSingle();

  const enabled = (row?.value as { enabled?: boolean } | null)?.enabled ?? false;
  return NextResponse.json({ demo_mode_enabled: enabled });
}

/**
 * POST /api/admin/demo
 * Body: { action: 'toggle' | 'load' }
 * - toggle: set demo_mode_enabled in app_settings
 * - load: run seed (demo org + APIs + plans). Admin only.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: userData } = await admin
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.action === 'toggle') {
    const { data: row } = await admin
      .from('app_settings')
      .select('value')
      .eq('key', DEMO_MODE_KEY)
      .maybeSingle();

    const current = (row?.value as { enabled?: boolean } | null)?.enabled ?? false;
    const next = !current;

    await admin.from('app_settings').upsert(
      {
        key: DEMO_MODE_KEY,
        value: { enabled: next },
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      },
      { onConflict: 'key' }
    );

    return NextResponse.json({ demo_mode_enabled: next });
  }

  if (body.action === 'load') {
    try {
      const result = await seedDemoData(admin, user.id);
      return NextResponse.json({
        message: 'Demo data loaded',
        org_id: result.orgId,
        api_ids: result.apiIds,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Seed failed';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
