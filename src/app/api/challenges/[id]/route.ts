import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = (await context.params).id;
  const supabase = await createClient();
  const { data: challenge, error } = await supabase
    .from('developer_challenges')
    .select('id, title, description, api_id, criteria_json, starts_at, ends_at, created_at')
    .eq('id', id)
    .single();
  if (error || !challenge) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { data: submissions } = await supabase
    .from('challenge_submissions')
    .select('id, user_id, score, status, proof_description, created_at')
    .eq('challenge_id', id)
    .order('score', { ascending: false, nullsFirst: false });
  const leaderboard = (submissions ?? []).slice(0, 20);
  return NextResponse.json({ challenge, submissions: submissions ?? [], leaderboard });
}
