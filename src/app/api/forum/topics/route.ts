import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('forum_topics')
    .select('id, title, slug, category, user_id, created_at')
    .order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ topics: data ?? [] });
}

export async function POST(request: Request) {
  const rateLimited = rateLimit(request, RATE_LIMITS.forum);
  if (rateLimited) return rateLimited;

  try {
    const context = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    const slug = (title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'topic').slice(0, 80) + '-' + Date.now().toString(36);
    const category = typeof body.category === 'string' ? body.category.slice(0, 50) : null;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forum_topics')
      .insert({ title, slug, category, user_id: context.user.id })
      .select('id, title, slug, category, created_at')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ topic: data });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
