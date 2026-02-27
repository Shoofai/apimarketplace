import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type PolicyType = 'spend_cap' | 'approved_apis' | 'rate_limit_override';

/**
 * GET /api/organizations/current/governance
 * Returns all governance policies for the current org.
 */
export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('org_governance_policies')
      .select('*')
      .eq('organization_id', context.organization_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ policies: data ?? [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PUT /api/organizations/current/governance
 * Upsert a single governance policy for the current org.
 * Body: { policy_type, config, is_active }
 */
export async function PUT(req: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const body = await req.json();

    const { policy_type, config, is_active } = body as {
      policy_type: PolicyType;
      config: Record<string, unknown>;
      is_active: boolean;
    };

    if (!['spend_cap', 'approved_apis', 'rate_limit_override'].includes(policy_type)) {
      return NextResponse.json({ error: 'Invalid policy_type' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('org_governance_policies')
      .select('id')
      .eq('organization_id', context.organization_id)
      .eq('policy_type', policy_type)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('org_governance_policies')
        .update({ config, is_active, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('org_governance_policies')
        .insert({
          organization_id: context.organization_id,
          policy_type,
          config,
          is_active,
          created_by: context.user.id,
        });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
