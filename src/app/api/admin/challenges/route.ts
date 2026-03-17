import { NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

/** POST /api/admin/challenges — create a new developer challenge */
export const POST = withPlatformAdmin(async (request: Request) => {
  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('developer_challenges')
    .insert({
      title,
      description: description || null,
      api_id: body.api_id || null,
      starts_at: body.starts_at || null,
      ends_at: body.ends_at || null,
      criteria_json: body.criteria_json || null,
    })
    .select('id, title, description, starts_at, ends_at, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ challenge: data }, { status: 201 });
});

/** PATCH /api/admin/challenges — update or deactivate a challenge */
export const PATCH = withPlatformAdmin(async (request: Request) => {
  const body = await request.json().catch(() => ({}));
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const allowed = ['title', 'description', 'starts_at', 'ends_at', 'criteria_json', 'active'];
  const filtered = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('developer_challenges')
    .update(filtered)
    .eq('id', id)
    .select('id, title, description, starts_at, ends_at, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ challenge: data });
});
