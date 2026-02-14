import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  let admin: { user: { id: string } };
  try {
    admin = await requirePlatformAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Forbidden';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = (await params).id;
  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === 'string' ? body.action : '';
  const notes = typeof body.notes === 'string' ? body.notes : null;

  if (!['dismiss', 'hide_content'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action. Use dismiss or hide_content' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: report, error: fetchError } = await supabase
    .from('content_reports')
    .select('id, resource_type, resource_id, status')
    .eq('id', id)
    .single();

  if (fetchError || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  if (report.status !== 'pending') {
    return NextResponse.json({ error: 'Report already processed' }, { status: 409 });
  }

  const reviewerId = admin.user.id;

  if (action === 'hide_content') {
    const { resource_type, resource_id } = report as { resource_type: string; resource_id: string };
    if (resource_type === 'forum_post') {
      const { error: upErr } = await supabase
        .from('forum_posts')
        .update({ hidden_at: new Date().toISOString(), hidden_by: reviewerId })
        .eq('id', resource_id);
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });
    } else if (resource_type === 'api_review') {
      const { error: upErr } = await supabase
        .from('api_reviews')
        .update({ hidden_at: new Date().toISOString(), hidden_by: reviewerId })
        .eq('id', resource_id);
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });
    }
    // forum_topic: optional future handling
  }

  const { error: updateError } = await supabase
    .from('content_reports')
    .update({
      status: action === 'hide_content' ? 'action_taken' : 'dismissed',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      notes: notes ?? undefined,
    })
    .eq('id', id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
