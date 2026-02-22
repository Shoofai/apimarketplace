import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('developer_challenges')
    .select('id, title, description, api_id, starts_at, ends_at, created_at')
    .order('created_at', { ascending: false })
    .limit(DEFAULT_LIST_LIMIT);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ challenges: data ?? [] });
}
