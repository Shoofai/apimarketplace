import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';
import { NotFoundError } from '@/lib/utils/errors';

/**
 * GET /api/ai/sessions/[id] — get one AI playground session.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    const { data: session, error } = await supabase
      .from('ai_playground_sessions')
      .select('id, api_id, language, messages, created_at, updated_at')
      .eq('id', id)
      .eq('user_id', context.user.id)
      .single();

    if (error || !session) throw new NotFoundError('Session not found');
    return NextResponse.json({ session });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    throw e;
  }
}
