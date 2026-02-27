import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/organizations/current/sso
 * Returns current SSO configuration.
 */
export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const { data } = await supabase
      .from('organizations')
      .select('sso_enabled, sso_provider_id, sso_domain')
      .eq('id', context.organization_id)
      .single();
    return NextResponse.json(data ?? {});
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/organizations/current/sso
 * Configure SAML SSO via Supabase Management API.
 * Body: { metadata_url?, metadata_xml?, sso_domain }
 *
 * Note: Actually registering a SAML provider requires calling the Supabase
 * Management API with a service-role-level management token, which is different
 * from the service role key. This endpoint stores the config and attempts to
 * call the Management API if SUPABASE_MANAGEMENT_API_TOKEN is set.
 */
export async function POST(req: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const body = await req.json();
    const { metadata_url, metadata_xml, sso_domain } = body;

    if (!metadata_url && !metadata_xml) {
      return NextResponse.json({ error: 'Provide metadata_url or metadata_xml' }, { status: 400 });
    }

    let providerId: string | null = null;

    // Try to register/update via Supabase Management API
    const managementToken = process.env.SUPABASE_MANAGEMENT_API_TOKEN;
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase/)?.[1];

    if (managementToken && projectRef) {
      const payload: Record<string, string> = {};
      if (metadata_url) payload.metadata_url = metadata_url;
      if (metadata_xml) payload.metadata_xml = metadata_xml;

      const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/config/auth/sso/providers`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${managementToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        providerId = data.id ?? null;
      } else {
        const err = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: `Supabase Management API error: ${err.message ?? response.statusText}` },
          { status: response.status }
        );
      }
    }

    // Store SSO config in organizations table
    await supabase
      .from('organizations')
      .update({
        sso_enabled: true,
        sso_provider_id: providerId,
        sso_domain: sso_domain || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', context.organization_id);

    return NextResponse.json({
      ok: true,
      provider_id: providerId,
      note: managementToken ? null : 'SUPABASE_MANAGEMENT_API_TOKEN not set — SSO config saved locally but not registered with Supabase.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/organizations/current/sso
 * Disable SSO for the organization.
 */
export async function DELETE() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    await supabase
      .from('organizations')
      .update({
        sso_enabled: false,
        sso_provider_id: null,
        sso_domain: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', context.organization_id);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
