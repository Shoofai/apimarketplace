import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const stakeholder_id = body?.stakeholder_id;
    const document_id = body?.document_id;
    const action = body?.action ?? 'viewed';
    const view_duration = body?.view_duration ?? null;
    const page_views = body?.page_views ?? null;

    if (!stakeholder_id || !document_id) {
      return NextResponse.json(
        { error: 'stakeholder_id and document_id required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    await admin.from('data_room_access_log').insert({
      stakeholder_id,
      document_id,
      action: String(action).slice(0, 50),
      view_duration: typeof view_duration === 'number' ? view_duration : null,
      page_views: page_views && typeof page_views === 'object' ? page_views : null,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('data-room log error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    );
  }
}
