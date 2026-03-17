// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';
import { AuthError } from '@/lib/utils/errors';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const id = (await ctx.params).id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: topic, error } = await supabase
    .from('forum_topics')
    .select('id, title, slug, category, user_id, created_at, upvote_count, post_count, body')
    .eq('id', id)
    .single();
  if (error || !topic) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { data: posts } = await supabase
    .from('forum_posts')
    .select('id, user_id, body, created_at')
    .eq('topic_id', id)
    .order('created_at', { ascending: true })
    .limit(DEFAULT_LIST_LIMIT);

  let userVoted = false;
  if (user) {
    const { data: vote } = await supabase
      .from('forum_votes')
      .select('id')
      .eq('topic_id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    userVoted = !!vote;
  }

  return NextResponse.json({ topic, posts: posts ?? [], userVoted });
}

/** Toggle upvote on a topic */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const context = await requireAuth();
    const topicId = (await ctx.params).id;
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from('forum_votes')
      .select('id')
      .eq('topic_id', topicId)
      .eq('user_id', context.user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('forum_votes').delete().eq('id', existing.id);
      return NextResponse.json({ voted: false });
    } else {
      await supabase.from('forum_votes').insert({ topic_id: topicId, user_id: context.user.id });
      return NextResponse.json({ voted: true });
    }
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
