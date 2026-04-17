import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/blog/[slug]/view
 * Public endpoint — increments view_count for the given blog post slug.
 * Rate-limiting relies on edge caching / Vercel infra; no auth required.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();

    const { data } = await supabase
      .from('blog_posts')
      .select('view_count')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!data) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    await supabase
      .from('blog_posts')
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq('slug', slug);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
