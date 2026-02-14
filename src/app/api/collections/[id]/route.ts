import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const id = (await params).id;
  const supabase = await createClient();
  const { data: collection, error: e1 } = await supabase
    .from('api_collections')
    .select('id, user_id, name, description, slug, is_public, created_at')
    .eq('id', id)
    .single();
  if (e1 || !collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const coll = collection as { user_id: string; is_public: boolean };
  const { data: { user } } = await supabase.auth.getUser();
  if (!coll.is_public && (!user || user.id !== coll.user_id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { data: items } = await supabase
    .from('api_collection_items')
    .select('api_id, sort_order')
    .eq('collection_id', id)
    .order('sort_order');
  const apiIds = (items ?? []).map((i) => (i as { api_id: string }).api_id);
  let apis: unknown[] = [];
  if (apiIds.length > 0) {
    const { data: apiRows } = await supabase
      .from('apis')
      .select('id, name, slug, short_description, logo_url, avg_rating, total_reviews')
      .in('id', apiIds)
      .eq('status', 'published');
    apis = apiRows ?? [];
  }
  return NextResponse.json({ collection, items: items ?? [], apis });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const context = await requireAuth();
    const id = (await params).id;
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from('api_collections')
      .select('user_id')
      .eq('id', id)
      .single();
    if (!existing || (existing as { user_id: string }).user_id !== context.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json().catch(() => ({}));
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim();
    if ('description' in body) updates.description = typeof body.description === 'string' ? body.description.slice(0, 500) : null;
    if (typeof body.is_public === 'boolean') updates.is_public = body.is_public;
    const { data, error } = await supabase
      .from('api_collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ collection: data });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const context = await requireAuth();
    const id = (await params).id;
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from('api_collections')
      .select('user_id')
      .eq('id', id)
      .single();
    if (!existing || (existing as { user_id: string }).user_id !== context.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await supabase.from('api_collections').delete().eq('id', id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
