import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { createReportSchema } from '@/lib/validations';
import { AuthError } from '@/lib/utils/errors';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const rateLimited = rateLimit(request, RATE_LIMITS.forum);
  if (rateLimited) return rateLimited;

  try {
    const auth = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const parsed = createReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors?.resource_type?.[0] ?? parsed.error.message },
        { status: 400 }
      );
    }
    const { resource_type, resource_id, reason } = parsed.data;

    const supabase = await createClient();

    // Ensure resource exists and is visible
    if (resource_type === 'forum_post') {
      const { data: post } = await supabase
        .from('forum_posts')
        .select('id')
        .eq('id', resource_id)
        .is('hidden_at', null)
        .single();
      if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    } else if (resource_type === 'api_review') {
      const { data: review } = await supabase
        .from('api_reviews')
        .select('id')
        .eq('id', resource_id)
        .is('hidden_at', null)
        .single();
      if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    } else {
      const { data: topic } = await supabase
        .from('forum_topics')
        .select('id')
        .eq('id', resource_id)
        .single();
      if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const { data: report, error } = await supabase
      .from('content_reports')
      .insert({
        reporter_id: auth.user.id,
        resource_type,
        resource_id,
        reason: reason ?? null,
        status: 'pending',
      })
      .select('id, status, created_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ report });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
