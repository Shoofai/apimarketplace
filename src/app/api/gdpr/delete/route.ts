// Call sites: API_ROUTE_CALLSITES.md (UI-3)
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

    let reason: string | null = null;
    const contentType = req.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        const body = await req.json();
        reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 2000) : null;
      } catch {
        // invalid JSON body; reason stays null
      }
    } else {
      const form = await req.formData();
      const raw = form.get('reason');
      reason = typeof raw === 'string' ? raw.trim().slice(0, 2000) : null;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('id, current_organization_id')
      .eq('id', user.id)
      .single();

    // Create deletion request with 30-day grace period
    const gracePeriodEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { data: request, error } = await supabase
      .from('data_deletion_requests')
      .insert({
        user_id: userData?.id,
        organization_id: userData?.current_organization_id,
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

