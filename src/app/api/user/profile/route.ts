import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

export async function PATCH(request: Request) {
  try {
    const context = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const full_name = typeof body.full_name === 'string' ? body.full_name.trim().slice(0, 200) : undefined;
    if (full_name === undefined) return NextResponse.json({ error: 'full_name required' }, { status: 400 });
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').update({ full_name }).eq('id', context.user.id).select('id, full_name').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ user: data });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
