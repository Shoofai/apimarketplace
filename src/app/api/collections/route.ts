import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

/** GET /api/collections - list current user's collections */
export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('api_collections')
      .select('id, name, description, slug, is_public, created_at')
      .eq('user_id', context.user.id)
      .order('updated_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ collections: data ?? [] });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}

/** POST /api/collections - create collection. Body: { name, description?, is_public? } */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'collection';
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 500) : null;
    const is_public = body.is_public === true;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('api_collections')
      .insert({
        user_id: context.user.id,
        name,
        description,
        slug: `${slug}-${Date.now().toString(36)}`,
        is_public,
      })
      .select('id, name, description, slug, is_public, created_at')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ collection: data });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
