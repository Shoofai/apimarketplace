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
 * PATCH /api/admin/feature-flags/[key]
 * Update feature flag
 */
export async function PATCH(
  req: Request,
  { params }: { params: { key: string } }
) {
  const supabase = await createClient();
  const { is_enabled } = await req.json();

  const { data, error } = await supabase
    .from('feature_flags')
    .update({ is_enabled })
    .eq('flag_key', params.key)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ flag: data });
}
