import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

export async function PATCH(request: Request) {
  try {
    const context = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : undefined;
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 80) : undefined;
    if (!name && !slug) return NextResponse.json({ error: 'name or slug required' }, { status: 400 });
    const supabase = await createClient();
    const updates: Record<string, string> = {};
    if (name) updates.name = name;
    if (slug) updates.slug = slug;
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', context.organization_id)
      .select('id, name, slug')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ organization: data });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
