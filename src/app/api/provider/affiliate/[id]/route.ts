import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/provider/affiliate/[id]
 * Update an affiliate link: commission %, toggle active, landing URL.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    // Verify ownership
    const { data: link } = await supabase
      .from('affiliate_links')
      .select('id, organization_id')
      .eq('id', id)
      .single();

    if (!link || link.organization_id !== context.organization_id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.commission_percent != null) updates.commission_percent = Number(body.commission_percent);
    if (body.is_active != null) updates.is_active = Boolean(body.is_active);
    if (body.landing_url !== undefined) updates.landing_url = body.landing_url || null;

    const { data, error } = await supabase
      .from('affiliate_links')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ link: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
