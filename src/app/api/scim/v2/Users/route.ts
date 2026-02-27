import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const SCIM_CONTENT_TYPE = 'application/scim+json';

function scimError(status: number, detail: string) {
  return NextResponse.json(
    {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status,
      detail,
    },
    { status, headers: { 'Content-Type': SCIM_CONTENT_TYPE } }
  );
}

/**
 * Authenticate SCIM requests using Bearer token stored in org's portal_settings.scim_token.
 * Returns the organization_id on success, null on failure.
 */
async function authenticateScim(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);

  const admin = createAdminClient();
  // Look for org with matching SCIM token (stored hashed in portal_settings)
  const { data: orgs } = await admin
    .from('organizations')
    .select('id, portal_settings')
    .not('portal_settings->scim_token', 'is', null);

  for (const org of orgs ?? []) {
    const settings = (org.portal_settings as any) ?? {};
    if (settings.scim_token === token) {
      return org.id;
    }
  }
  return null;
}

function userToScim(member: {
  user_id: string;
  role: string;
  users?: { email?: string; full_name?: string } | null;
}, orgId: string) {
  const user = (member as any).users ?? {};
  const name = user.full_name ?? '';
  const parts = name.split(' ');
  return {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    id: member.user_id,
    userName: user.email ?? member.user_id,
    name: {
      formatted: name,
      givenName: parts[0] ?? '',
      familyName: parts.slice(1).join(' ') ?? '',
    },
    emails: user.email ? [{ value: user.email, primary: true }] : [],
    active: true,
    meta: {
      resourceType: 'User',
      location: `/api/scim/v2/Users/${member.user_id}`,
    },
  };
}

/**
 * GET /api/scim/v2/Users
 * List org members in SCIM format.
 */
export async function GET(request: NextRequest) {
  const orgId = await authenticateScim(request);
  if (!orgId) return scimError(401, 'Unauthorized');

  const admin = createAdminClient();
  const sp = request.nextUrl.searchParams;
  const startIndex = Math.max(1, parseInt(sp.get('startIndex') ?? '1'));
  const count = Math.min(100, parseInt(sp.get('count') ?? '100'));

  const { data: members, count: total } = await admin
    .from('organization_members')
    .select('user_id, role, users(email, full_name)', { count: 'exact' })
    .eq('organization_id', orgId)
    .range(startIndex - 1, startIndex - 1 + count - 1);

  const resources = (members ?? []).map((m) => userToScim(m as any, orgId));

  return NextResponse.json(
    {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: total ?? 0,
      startIndex,
      itemsPerPage: count,
      Resources: resources,
    },
    { headers: { 'Content-Type': SCIM_CONTENT_TYPE } }
  );
}

/**
 * POST /api/scim/v2/Users
 * Create (provision) a user and add them to the org.
 */
export async function POST(request: NextRequest) {
  const orgId = await authenticateScim(request);
  if (!orgId) return scimError(401, 'Unauthorized');

  const body = await request.json().catch(() => null);
  if (!body) return scimError(400, 'Invalid JSON body');

  const email = body.emails?.[0]?.value ?? body.userName;
  if (!email) return scimError(400, 'Email (userName) is required');

  const admin = createAdminClient();

  // Create Supabase Auth user
  const { data: authUser, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      full_name: body.name?.formatted ?? `${body.name?.givenName ?? ''} ${body.name?.familyName ?? ''}`.trim(),
    },
  });

  if (createErr) {
    if (createErr.message.includes('already')) {
      // User exists; look up their ID
      const { data: users } = await admin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      if (!users) return scimError(409, 'User already exists');

      // Add to org if not already a member
      await admin.from('organization_members').upsert(
        { organization_id: orgId, user_id: users.id, role: 'member' },
        { onConflict: 'organization_id,user_id', ignoreDuplicates: true }
      );

      return NextResponse.json(userToScim({ user_id: users.id, role: 'member', users: { email } }, orgId), {
        status: 200,
        headers: { 'Content-Type': SCIM_CONTENT_TYPE },
      });
    }
    return scimError(500, createErr.message);
  }

  const userId = authUser.user.id;

  // Add to org
  await admin.from('organization_members').upsert(
    { organization_id: orgId, user_id: userId, role: 'member' },
    { onConflict: 'organization_id,user_id', ignoreDuplicates: true }
  );

  return NextResponse.json(
    userToScim({ user_id: userId, role: 'member', users: { email } }, orgId),
    { status: 201, headers: { 'Content-Type': SCIM_CONTENT_TYPE } }
  );
}

/**
 * PATCH /api/scim/v2/Users
 * Bulk partial updates — not in scope (return 501).
 */
export async function PATCH(request: NextRequest) {
  const orgId = await authenticateScim(request);
  if (!orgId) return scimError(401, 'Unauthorized');
  return scimError(501, 'PATCH on collection not supported. Use PATCH /api/scim/v2/Users/{id}');
}
