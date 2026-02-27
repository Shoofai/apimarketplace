import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/apis/[id]/sla/violations/[vid]
 * Acknowledge a SLA violation.
 */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string; vid: string }> }
) {
  try {
    const context = await requireAuth();
    const { id, vid } = await params;
    const supabase = await createClient();

    const { data: api } = await supabase
      .from('apis')
      .select('organization_id')
      .eq('id', id)
      .single();

    if (!api || api.organization_id !== context.organization_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await supabase
      .from('sla_violations')
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString(), acknowledged_by: context.user.id })
      .eq('id', vid)
      .eq('api_id', id);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
