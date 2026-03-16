import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

/**
 * Increment affiliate link click count.
 * Called fire-and-forget from the middleware when ?aff= param is present.
 * 
 * POST /api/affiliate/track-click
 */
export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== 'string' || !/^[a-zA-Z0-9_-]{3,64}$/.test(code)) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Use RPC to atomically increment click_count
    const { error } = await supabase.rpc('increment_affiliate_click' as any, { link_code: code });

    if (error) {
      // Fallback: manual fetch + increment if RPC doesn't exist
      const { data: link } = await supabase
        .from('affiliate_links')
        .select('id, click_count')
        .eq('code', code)
        .maybeSingle();

      if (link) {
        await supabase
          .from('affiliate_links')
          .update({ click_count: ((link.click_count as number) ?? 0) + 1 } as any)
          .eq('id', link.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.warn('Affiliate click tracking failed', { error: err });
    return NextResponse.json({ ok: false }, { status: 200 }); // Always 200 — non-critical
  }
}
