import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

/**
 * GET /api/ai/sessions — list AI playground sessions for the current user.
 */
export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const { data: sessions, error } = await supabase
      .from('ai_playground_sessions')
      .select('id, api_id, language, messages, created_at, updated_at')
      .eq('user_id', context.user.id)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ sessions: sessions ?? [] });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}

/**
 * POST /api/ai/sessions — create or update an AI playground session.
 * Body: { id?: string, apiId?: string, language: string, messages: { role, content, timestamp }[] }
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));
    const { id: sessionId, apiId, language, messages } = body as {
      id?: string;
      apiId?: string;
      language?: string;
      messages?: { role: string; content: string; timestamp: string }[];
    };

    const lang = typeof language === 'string' ? language : 'javascript';
    const msgs = Array.isArray(messages) ? messages : [];

    if (sessionId) {
      const { data: existing, error: fetchErr } = await supabase
        .from('ai_playground_sessions')
        .select('id, user_id')
        .eq('id', sessionId)
        .single();
      if (fetchErr || !existing || (existing as { user_id: string }).user_id !== context.user.id) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      const { data: updated, error } = await supabase
        .from('ai_playground_sessions')
        .update({
          messages: msgs,
          language: lang,
          api_id: apiId || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ session: updated });
    }

    const { data: created, error } = await supabase
      .from('ai_playground_sessions')
      .insert({
        user_id: context.user.id,
        organization_id: context.organization_id,
        api_id: apiId || null,
        language: lang,
        messages: msgs,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ session: created });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
