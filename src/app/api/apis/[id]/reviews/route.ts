import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { createReviewSchema } from '@/lib/validations';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/apis/[id]/reviews
 * Body: { rating: number, title?: string, body?: string }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const rateLimited = rateLimit(request, RATE_LIMITS.reviews);
  if (rateLimited) return rateLimited;

  try {
    const context = await requireAuth();
    const apiId = (await params).id;
    if (!apiId) {
      return NextResponse.json({ error: 'API ID required' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = createReviewSchema.safeParse({
      rating: body.rating,
      title: body.title,
      body: body.body,
    });
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors?.rating?.[0]
        ?? parsed.error.flatten().fieldErrors?.title?.[0]
        ?? parsed.error.flatten().fieldErrors?.body?.[0]
        ?? 'Validation failed';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const { rating, title, body: reviewBody } = parsed.data;

    const supabase = await createClient();

    const { data: api } = await supabase
      .from('apis')
      .select('id')
      .eq('id', apiId)
      .eq('status', 'published')
      .single();

    if (!api) {
      return NextResponse.json({ error: 'API not found' }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from('api_reviews')
      .select('id')
      .eq('api_id', apiId)
      .eq('user_id', context.user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this API. Edit or delete your existing review.' },
        { status: 409 }
      );
    }

    const { data: review, error: insertError } = await supabase
      .from('api_reviews')
      .insert({
        api_id: apiId,
        user_id: context.user.id,
        rating,
        title: title ?? null,
        body: reviewBody ?? null,
      })
      .select('id, rating, title, body, created_at')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    const { data: agg } = await supabase
      .from('api_reviews')
      .select('rating')
      .eq('api_id', apiId);

    const count = agg?.length ?? 0;
    const avg = count > 0
      ? agg!.reduce((s, r) => s + (r as { rating: number }).rating, 0) / count
      : 0;

    await supabase
      .from('apis')
      .update({
        avg_rating: Math.round(avg * 10) / 10,
        total_reviews: count,
      })
      .eq('id', apiId);

    return NextResponse.json({ review });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
