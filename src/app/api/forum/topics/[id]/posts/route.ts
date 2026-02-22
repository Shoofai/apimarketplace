// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { createForumPostSchema } from '@/lib/validations';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const rateLimited = rateLimit(request, RATE_LIMITS.forum);
  if (rateLimited) return rateLimited;

  try {
    const contextAuth = await requireAuth();
    const topicId = (await context.params).id;
    const body = await request.json().catch(() => ({}));
    const parsed = createForumPostSchema.safeParse({ body: body.body ?? '' });
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors?.body?.[0] ?? 'Validation failed';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const postBody = parsed.data.body.trim();
    const supabase = await createClient();
    const { data: topic } = await supabase.from('forum_topics').select('id').eq('id', topicId).single();
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert({ topic_id: topicId, user_id: contextAuth.user.id, body: postBody })
      .select('id, body, created_at')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ post });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
