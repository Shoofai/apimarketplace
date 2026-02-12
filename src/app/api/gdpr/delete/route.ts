import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/gdpr/delete
 * Request account deletion (GDPR right to erasure)
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason } = await req.json();

    const { data: userData } = await supabase
      .from('users')
      .select('id, default_organization_id')
      .eq('auth_id', user.id)
      .single();

    // Create deletion request with 30-day grace period
    const gracePeriodEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { data: request, error } = await supabase
      .from('data_deletion_requests')
      .insert({
        user_id: userData?.id,
        organization_id: userData?.default_organization_id,
        reason,
        status: 'grace_period',
        grace_period_ends_at: gracePeriodEndsAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: `Account deletion scheduled. You have 30 days to cancel this request. Your account will be permanently deleted on ${gracePeriodEndsAt.toLocaleDateString()}.`,
      request_id: request.id,
      grace_period_ends_at: gracePeriodEndsAt.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/gdpr/delete/[id]
 * Cancel deletion request during grace period
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    // Cancel the deletion request
    const { error } = await supabase
      .from('data_deletion_requests')
      .update({ status: 'cancelled' })
      .eq('id', params.id)
      .eq('user_id', userData?.id)
      .eq('status', 'grace_period');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: 'Account deletion cancelled successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
