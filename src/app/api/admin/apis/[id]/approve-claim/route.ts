import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPlatformAdmin } from '@/lib/auth/admin';
import { dispatchNotification } from '@/lib/notifications/dispatcher';

/**
 * PATCH /api/admin/apis/[id]/approve-claim
 * Approve an API claim: transfer ownership to claiming org, set status to draft
 */
export const PATCH = withPlatformAdmin(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const supabase = await createClient();

    const { data: api, error: fetchError } = await supabase
      .from('apis')
      .select('id, name, status, claimed_by_organization_id, organization_id')
      .eq('id', id)
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

    const newOrgId = api.claimed_by_organization_id;

    const { data: updatedApi, error } = await supabase
      .from('apis')
      .update({
        organization_id: newOrgId,
        status: 'draft',
        claimed_at: new Date().toISOString(),
        claimed_by_organization_id: null,
        claim_requested_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, organizations(name)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: owner } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', newOrgId)
      .eq('role', 'owner')
      .single();

    if (owner) {
      await dispatchNotification({
        type: 'api.status_changed',
        userId: owner.user_id,
        organizationId: newOrgId,
        title: 'API Claim Approved',
        body: `Your claim for "${api.name}" has been approved. Configure and publish it from My APIs.`,
        link: `/dashboard/apis/${api.id}`,
        metadata: { api_id: api.id, status: 'draft' },
      });
    }

    return NextResponse.json({ api: updatedApi });
  }
);
