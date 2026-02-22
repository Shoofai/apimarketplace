import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_PLATFORM_NAME, PLATFORM_NAME_KEY } from '@/lib/settings/platform-name';

/**
 * GET /api/admin/settings/platform-name
 * Returns current platform name (admin only).
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from('app_settings')
    .select('value')
    .eq('key', PLATFORM_NAME_KEY)
    .maybeSingle();

  const value = row?.value as { name?: string } | null;
  const name = value?.name ?? DEFAULT_PLATFORM_NAME;
  return NextResponse.json({ name });
}

/**
 * PATCH /api/admin/settings/platform-name
 * Update platform display name (admin only).
 * Body: { name: string }
 */
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from('app_settings').upsert(
    {
      key: PLATFORM_NAME_KEY,
      value: { name },
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    },
    { onConflict: 'key' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ name });
}
