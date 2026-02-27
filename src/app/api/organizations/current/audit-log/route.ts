// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const sp = new URL(request.url).searchParams;

    const limit = Math.min(Number(sp.get('limit') || 50), 1000);
    const offset = Math.max(Number(sp.get('offset') || 0), 0);
    const action = sp.get('action') || undefined;
    const resource_type = sp.get('resource_type') || undefined;
    const status = sp.get('status') || undefined;
    const user_id = sp.get('user_id') || undefined;
    const from = sp.get('from') || undefined;
    const to = sp.get('to') || undefined;

    let query = supabase
      .from('audit_logs')
      .select('id, action, resource_type, resource_id, status, user_id, ip_address, metadata, created_at', { count: 'exact' })
      .eq('organization_id', context.organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (action) query = query.eq('action', action);
    if (resource_type) query = query.eq('resource_type', resource_type);
    if (status) query = query.eq('status', status);
    if (user_id) query = query.eq('user_id', user_id);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ logs: data ?? [], total: count ?? 0 });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
