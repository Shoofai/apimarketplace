import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPlatformAdmin } from '@/lib/auth/admin';
import { dispatchNotification } from '@/lib/notifications/dispatcher';

/**
 * PATCH /api/admin/apis/[id]/reject
 * Reject an API submission
 */
export const PATCH = withPlatformAdmin(
  async (req: Request, { params }: { params: { id: string } }) => {
    const supabase = await createClient();
    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason required' }, { status: 400 });
    }

    // Update API status
    const { data: api, error } = await supabase
      .from('apis')
      .update({
        status: 'rejected',
      })
      .eq('id', params.id)
      .select('*, organizations(name)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get provider owner for notification
    const { data: owner } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', api.organization_id)
      .eq('role', 'owner')
      .single();

    if (owner) {
      await dispatchNotification({
        type: 'api.status_changed',
        userId: owner.user_id,
        organizationId: api.organization_id,
        title: 'API Rejected',
        body: `Your API "${api.name}" was not approved. Reason: ${reason}`,
        link: `/dashboard/provider/apis/${api.id}`,
        metadata: { api_id: api.id, status: 'rejected', reason },
      });
    }

    return NextResponse.json({ api });
  }
);
