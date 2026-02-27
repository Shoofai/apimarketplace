import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { runAndStoreReview } from '@/lib/ai/api-reviewer';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/apis/[id]/submit-review
 * Provider submits their API for admin review.
 * Sets status → in_review and runs the AI quality scorer.
 */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    // Verify caller owns this API
    const { data: api, error: fetchErr } = await supabase
      .from('apis')
      .select('id, name, description, short_description, base_url, version, organization_id, status')
      .eq('id', id)
      .single();

    if (fetchErr || !api) {
      return NextResponse.json({ error: 'API not found' }, { status: 404 });
    }

    if (api.organization_id !== context.organization_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!['draft', 'in_review'].includes(api.status ?? '')) {
      return NextResponse.json(
        { error: 'Only draft or in_review APIs can be submitted for review' },
        { status: 400 }
      );
    }

    // Set status to in_review
    const { error: updateErr } = await supabase
      .from('apis')
      .update({ status: 'in_review', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Load OpenAPI spec (best-effort; may be null)
    const { data: specRow } = await supabase
      .from('api_specs')
      .select('openapi_raw')
      .eq('api_id', id)
      .single();

    const openApiRaw = specRow?.openapi_raw ?? null;

    // Run AI reviewer asynchronously-ish (still in-request, but non-blocking for user experience)
    const score = await runAndStoreReview(api, openApiRaw);

    return NextResponse.json({ status: 'in_review', score });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
