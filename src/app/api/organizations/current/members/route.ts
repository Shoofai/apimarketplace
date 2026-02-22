import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('organization_members')
      .select('user_id, role, users(id, email, full_name)')
      .eq('organization_id', context.organization_id)
      .limit(DEFAULT_LIST_LIMIT);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ members: data ?? [] });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
