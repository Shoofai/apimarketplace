import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

type Params = { params: Promise<{ id: string }> };

/** POST /api/collections/[id]/apis - add API. Body: { api_id: string } */
export async function POST(request: Request, { params }: Params) {
  try {
    const context = await requireAuth();
    const id = (await params).id;
    const body = await request.json().catch(() => ({}));
    const api_id = body.api_id;
    if (!api_id || typeof api_id !== 'string') {
      return NextResponse.json({ error: 'api_id required' }, { status: 400 });
    }
    const supabase = await createClient();
    const { data: coll } = await supabase
      .from('api_collections')
      .select('user_id')
      .eq('id', id)
      .single();
    if (!coll || (coll as { user_id: string }).user_id !== context.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { data: item, error } = await supabase
      .from('api_collection_items')
      .insert({ collection_id: id, api_id, sort_order: 0 })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ item });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}

/** DELETE /api/collections/[id]/apis?api_id=uuid - remove API from collection */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const context = await requireAuth();
    const id = (await params).id;
    const api_id = new URL(request.url).searchParams.get('api_id');
    if (!api_id) return NextResponse.json({ error: 'api_id required' }, { status: 400 });
    const supabase = await createClient();
    const { data: coll } = await supabase
      .from('api_collections')
      .select('user_id')
      .eq('id', id)
      .single();
    if (!coll || (coll as { user_id: string }).user_id !== context.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await supabase
      .from('api_collection_items')
      .delete()
      .eq('collection_id', id)
      .eq('api_id', api_id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
