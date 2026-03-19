import { NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const ipAllowlistSchema = z.object({
  ips: z.array(z.string().regex(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/, 'Invalid IPv4 or CIDR')).max(100),
  is_active: z.boolean().default(true),
});

export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const { data } = await supabase
      .from('org_governance_policies')
      .select('config, is_active')
      .eq('organization_id', context.organization_id)
      .eq('policy_type', 'ip_allowlist')
      .maybeSingle();

    return NextResponse.json({
      ips: (data?.config as { ips?: string[] } | null)?.ips ?? [],
      is_active: data?.is_active ?? false,
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const context = await requirePermission('settings.manage');
    const supabase = await createClient();
    const body = await request.json();
    const parsed = ipAllowlistSchema.parse(body);

    const { error } = await supabase
      .from('org_governance_policies')
      .upsert(
        {
          organization_id: context.organization_id,
          policy_type: 'ip_allowlist',
          config: { ips: parsed.ips },
          is_active: parsed.is_active,
        },
        { onConflict: 'organization_id,policy_type' }
      );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update IP allowlist' }, { status: 500 });
  }
}
