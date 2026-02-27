import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const SCIM_CONTENT_TYPE = 'application/scim+json';

function scimError(status: number, detail: string) {
  return NextResponse.json(
    { schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'], status, detail },
    { status, headers: { 'Content-Type': SCIM_CONTENT_TYPE } }
  );
}

async function authenticateScim(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);

  const admin = createAdminClient();
  const { data: orgs } = await admin
    .from('organizations')
    .select('id, portal_settings')
    .not('portal_settings->scim_token', 'is', null);

  for (const org of orgs ?? []) {
    const settings = (org.portal_settings as any) ?? {};
    if (settings.scim_token === token) return org.id;
  }
  return null;
}

/**
 * PATCH /api/scim/v2/Users/[id]
 * Update user active state (activate/deactivate).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const orgId = await authenticateScim(request);
  if (!orgId) return scimError(401, 'Unauthorized');

  const { id } = await params;
  const admin = createAdminClient();
  const body = await request.json().catch(() => null);

  // Handle SCIM replace operations
  const ops: { op: string; path?: string; value: unknown }[] = body?.Operations ?? [];
  for (const op of ops) {
    if (op.op?.toLowerCase() === 'replace' && op.path === 'active') {
      const active = op.value === true || op.value === 'true';
      if (!active) {
        // Deactivate: ban user in Supabase Auth
        await admin.auth.admin.updateUserById(id, { ban_duration: '876600h' }); // ~100 years
      } else {
        // Re-activate
        await admin.auth.admin.updateUserById(id, { ban_duration: 'none' });
      }
    }
  }

  // Return updated user
  const { data: member } = await admin
    .from('organization_members')
    .select('user_id, role, users(email, full_name)')
    .eq('organization_id', orgId)
    .eq('user_id', id)
    .single();

  if (!member) return scimError(404, 'User not found in organization');

  const user = (member as any).users ?? {};
  return NextResponse.json(
    {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: member.user_id,
      userName: user.email ?? member.user_id,
      active: true,
      meta: { resourceType: 'User', location: `/api/scim/v2/Users/${member.user_id}` },
    },
    { headers: { 'Content-Type': SCIM_CONTENT_TYPE } }
  );
}

/**
 * GET /api/scim/v2/Users/[id]
 * Fetch a single user by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const orgId = await authenticateScim(request);
  if (!orgId) return scimError(401, 'Unauthorized');

  const { id } = await params;
  const admin = createAdminClient();

  const { data: member } = await admin
    .from('organization_members')
    .select('user_id, role, users(email, full_name)')
    .eq('organization_id', orgId)
    .eq('user_id', id)
    .single();

  if (!member) return scimError(404, 'User not found in organization');

  const user = (member as any).users ?? {};
  const name = user.full_name ?? '';
  const parts = name.split(' ');

  return NextResponse.json(
    {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: member.user_id,
      userName: user.email ?? member.user_id,
      name: { formatted: name, givenName: parts[0] ?? '', familyName: parts.slice(1).join(' ') },
      emails: user.email ? [{ value: user.email, primary: true }] : [],
      active: true,
      meta: { resourceType: 'User', location: `/api/scim/v2/Users/${member.user_id}` },
    },
    { headers: { 'Content-Type': SCIM_CONTENT_TYPE } }
  );
}
