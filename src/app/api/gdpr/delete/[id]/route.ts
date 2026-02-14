import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * DELETE /api/gdpr/delete/[id]
 * Cancel deletion request during grace period
 */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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
      .eq('id', user.id)
      .single();

    const { error } = await supabase
      .from('data_deletion_requests')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('user_id', userData?.id)
      .eq('status', 'grace_period');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: 'Account deletion cancelled successfully.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to cancel';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
