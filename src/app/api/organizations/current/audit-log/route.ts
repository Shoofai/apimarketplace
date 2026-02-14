import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

export async function GET(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const limit = Math.min(Number(new URL(request.url).searchParams.get('limit') || 50), 100);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, action, actor_id, metadata, created_at')
      .eq('organization_id', context.organization_id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ logs: data ?? [] });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
