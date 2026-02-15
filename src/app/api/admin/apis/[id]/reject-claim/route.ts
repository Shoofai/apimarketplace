import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPlatformAdmin } from '@/lib/auth/admin';
import { dispatchNotification } from '@/lib/notifications/dispatcher';

/**
 * PATCH /api/admin/apis/[id]/reject-claim
 * Reject an API claim: reset to unclaimed
 */
export const PATCH = withPlatformAdmin(
  async (req: Request, { params }: { params: { id: string } }) => {
    const supabase = await createClient();
    const body = await req.json().catch(() => ({}));
    const reason = (body as { reason?: string })?.reason ?? 'No reason provided';

    const { data: api, error: fetchError } = await supabase
      .from('apis')
      .select('id, name, status, claimed_by_organization_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !api) {
      return NextResponse.json({ error: 'API not found' }, { status: 404 });
    }

    if (api.status !== 'claim_pending' || !api.claimed_by_organization_id) {
      return NextResponse.json(
        { error: 'API is not pending a claim' },
        { status: 400 }
      );
    }

    const claimingOrgId = api.claimed_by_organization_id;

    const { data: updatedApi, error } = await supabase
      .from('apis')
      .update({
        status: 'unclaimed',
        claimed_by_organization_id: null,
        claim_requested_at: null,
        claimed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select('*, organizations(name)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: owner } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', claimingOrgId)
      .eq('role', 'owner')
      .single();

    if (owner) {
      await dispatchNotification({
        type: 'api.status_changed',
        userId: owner.user_id,
        organizationId: claimingOrgId,
        title: 'API Claim Rejected',
        body: `Your claim for "${api.name}" was not approved. Reason: ${reason}`,
        link: '/marketplace',
        metadata: { api_id: api.id, status: 'unclaimed', reason },
      });
    }

    return NextResponse.json({ api: updatedApi });
  }
);
