import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  HERO_VARIANT_KEY,
  getHeroVariant,
  type HeroVariant,
} from '@/lib/settings/hero-variant';

function isValidVariant(v: string): v is HeroVariant {
  return v === 'classic' || v === 'developer' || v === 'split';
}

/**
 * GET /api/admin/settings/hero-variant
 * Returns current hero variant (admin only).
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

  const variant = await getHeroVariant();
  return NextResponse.json({ variant });
}

/**
 * PATCH /api/admin/settings/hero-variant
 * Update hero variant (admin only).
 * Body: { variant: 'classic' | 'developer' | 'split' }
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

  let body: { variant?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const variant = typeof body.variant === 'string' ? body.variant.trim() : '';
  if (!isValidVariant(variant)) {
    return NextResponse.json(
      { error: 'variant must be "classic", "developer", or "split"' },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.from('app_settings').upsert(
    {
      key: HERO_VARIANT_KEY,
      value: { variant },
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    },
    { onConflict: 'key' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ variant });
}
