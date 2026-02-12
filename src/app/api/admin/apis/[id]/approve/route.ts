import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPlatformAdmin } from '@/lib/auth/admin';
import { dispatchNotification } from '@/lib/notifications/dispatcher';

/**
 * PATCH /api/admin/apis/[id]/approve
 * Approve an API for publishing
 */
export const PATCH = withPlatformAdmin(
  async (req: Request, { params }: { params: { id: string } }) => {
    const supabase = await createClient();

    // Update API status
    const { data: api, error } = await supabase
      .from('apis')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
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
        title: 'API Approved',
        body: `Your API "${api.name}" has been approved and is now published.`,
        link: `/dashboard/provider/apis/${api.id}`,
        metadata: { api_id: api.id, status: 'published' },
      });
    }

    return NextResponse.json({ api });
  }
);
