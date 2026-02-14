import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    await requirePlatformAdmin();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Forbidden';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? 'pending';

  const supabase = await createClient();
  let query = supabase
    .from('content_reports')
    .select('id, resource_type, resource_id, reason, status, created_at, reviewed_at, reviewed_by, notes, reporter_id')
    .order('created_at', { ascending: false });

  if (status && ['pending', 'dismissed', 'action_taken'].includes(status)) {
    query = query.eq('status', status);
  }

  const { data: reports, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const reporterIds = [...new Set((reports ?? []).map((r: { reporter_id: string }) => r.reporter_id))];
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name')
    .in('id', reporterIds);

  const userMap = new Map((users ?? []).map((u: { id: string; full_name?: string }) => [u.id, u.full_name ?? 'Unknown']));

  const withReporter = (reports ?? []).map((r: { reporter_id: string; [k: string]: unknown }) => ({
    ...r,
    reporter_name: userMap.get(r.reporter_id) ?? 'Unknown',
  }));

  return NextResponse.json({ reports: withReporter });
}
