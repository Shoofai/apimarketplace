import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('is_platform_admin').eq('id', user.id).single();
  return data?.is_platform_admin ? user : null;
}

export async function GET() {
  const adminClient = createAdminClient();
  const { data } = await adminClient.from('app_settings').select('value').eq('key', 'site_mode').maybeSingle();
  const v = data?.value as { mode?: string; message?: string | null } | null;
  return NextResponse.json({ mode: v?.mode ?? 'live', message: v?.message ?? null });
}

export async function PATCH(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { mode, message } = await request.json();
  if (!['live', 'prelaunch', 'maintenance'].includes(mode)) {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  }

  const adminClient = createAdminClient();
  await adminClient.from('app_settings').upsert(
    { key: 'site_mode', value: { mode, message: message ?? null }, updated_at: new Date().toISOString(), updated_by: user.id },
    { onConflict: 'key' }
  );

  return NextResponse.json({ success: true, mode, message });
}
