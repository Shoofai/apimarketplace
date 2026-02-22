import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

export async function GET() {
  try {
    const ctx = await requireAuth();
    const supabase = await createClient();
    const { data, error } = await supabase.from('referrals').select('id, referred_email, code, status, created_at').eq('referrer_id', ctx.user.id).order('created_at', { ascending: false }).limit(DEFAULT_LIST_LIMIT);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ referrals: data ?? [] });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    throw err;
  }
}
