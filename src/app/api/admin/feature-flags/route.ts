// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPlatformAdmin } from '@/lib/auth/admin';

/**
 * GET /api/admin/feature-flags
 * Get all feature flags
 */
export const GET = withPlatformAdmin(async () => {
  const supabase = await createClient();

  const { data: flags, error } = await supabase
    .from('feature_flags')
    .select('*')
    .order('flag_name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ flags });
});

/**
 * PATCH /api/admin/feature-flags
 * Update feature flag by key (body: { key, is_enabled })
 */
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { key, is_enabled } = await req.json();
  if (!key || typeof key !== 'string') {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('feature_flags')
    .update({ is_enabled })
    .eq('flag_key', key)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ flag: data });
}
