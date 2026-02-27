import { NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { runAndStoreReview } from '@/lib/ai/api-reviewer';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/apis/[id]/review-score
 * Admin re-runs the AI quality scorer for an API.
 */
export const POST = withPlatformAdmin(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const supabase = await createClient();

    const { data: api, error: fetchErr } = await supabase
      .from('apis')
      .select('id, name, description, short_description, base_url, version')
      .eq('id', id)
      .single();

    if (fetchErr || !api) {
      return NextResponse.json({ error: 'API not found' }, { status: 404 });
    }

    const { data: specRow } = await supabase
      .from('api_specs')
      .select('openapi_raw')
      .eq('api_id', id)
      .single();

    const score = await runAndStoreReview(api, specRow?.openapi_raw ?? null);
    return NextResponse.json({ score });
  }
);
