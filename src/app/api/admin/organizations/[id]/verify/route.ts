// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPlatformAdmin } from '@/lib/auth/admin';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/organizations/[id]/verify
 * Body: { verified: boolean }
 */
export const PATCH = withPlatformAdmin(async (req: Request, { params }: RouteParams) => {
  const orgId = (await params).id;
  if (!orgId) return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const verified = body.verified === true;

  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id, settings, type')
    .eq('id', orgId)
    .single();

  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

  const settings = (org.settings as Record<string, unknown>) ?? {};
  const updated = { ...settings, verified };

  const { data, error } = await supabase
    .from('organizations')
    .update({ settings: updated })
    .eq('id', orgId)
    .select('id, name, settings')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ organization: data });
});
