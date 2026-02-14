import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

/**
 * GET /api/user/onboarding - Get onboarding progress
 */
export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const { data: user } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', context.user.id)
      .single();

    const completed = (user as any)?.onboarding_completed ?? false;
    return NextResponse.json({ onboarding_completed: completed });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}

/**
 * PATCH /api/user/onboarding - Update onboarding progress
 * Body: { onboarding_completed?: boolean }
 */
export async function PATCH(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));

    if (typeof body.onboarding_completed !== 'boolean') {
      return NextResponse.json({ error: 'onboarding_completed is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('users')
      .update({ onboarding_completed: body.onboarding_completed, updated_at: new Date().toISOString() })
      .eq('id', context.user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
