import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id: apiId } = await params;
    const supabase = await createClient();

    const { data: api, error: apiError } = await supabase
      .from('apis')
      .select('id, organization_id')
      .eq('id', apiId)
      .single();

    if (apiError || !api) throw new NotFoundError('API not found');
    if (api.organization_id !== context.organization_id) {
      throw new ForbiddenError('Not authorized to manage this API');
    }

    const { data: plans, error } = await supabase
      .from('api_pricing_plans')
      .select('id, name, slug, included_calls, rate_limit_per_second, rate_limit_per_day, rate_limit_per_month, sort_order')
      .eq('api_id', apiId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ plans: plans ?? [] });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id: apiId } = await params;
    const supabase = await createClient();

    const { data: api, error: apiError } = await supabase
      .from('apis')
      .select('id, organization_id')
      .eq('id', apiId)
      .single();

    if (apiError || !api) throw new NotFoundError('API not found');
    if (api.organization_id !== context.organization_id) {
      throw new ForbiddenError('Not authorized to manage this API');
    }

    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { data: existing } = await supabase
      .from('api_pricing_plans')
      .select('sort_order')
      .eq('api_id', apiId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();
    const nextOrder = ((existing as { sort_order?: number } | null)?.sort_order ?? -1) + 1;

    const { data: plan, error } = await supabase
      .from('api_pricing_plans')
      .insert({
        api_id: apiId,
        name,
        slug: `${slug}-${Date.now().toString(36)}`,
        included_calls: typeof body.included_calls === 'number' ? body.included_calls : null,
        rate_limit_per_second: typeof body.rate_limit_per_second === 'number' ? body.rate_limit_per_second : null,
        rate_limit_per_day: typeof body.rate_limit_per_day === 'number' ? body.rate_limit_per_day : null,
        rate_limit_per_month: typeof body.rate_limit_per_month === 'number' ? body.rate_limit_per_month : null,
        is_active: true,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ plan });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}
