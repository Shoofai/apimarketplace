// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const id = (await ctx.params).id;
  const supabase = await createClient();
  const { data: topic, error } = await supabase
    .from('forum_topics')
    .select('id, title, slug, category, user_id, created_at')
    .eq('id', id)
    .single();
  if (error || !topic) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { data: posts } = await supabase
    .from('forum_posts')
    .select('id, user_id, body, created_at')
    .eq('topic_id', id)
    .order('created_at', { ascending: true })
    .limit(DEFAULT_LIST_LIMIT);
  return NextResponse.json({ topic, posts: posts ?? [] });
}
