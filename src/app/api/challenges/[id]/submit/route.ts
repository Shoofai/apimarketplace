// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

type Params = { params: Promise<{ id: string }> };

/** POST /api/challenges/[id]/submit - submit to challenge. Body: { proof_description?, proof_url? } */
export async function POST(request: Request, { params }: Params) {
  try {
    const context = await requireAuth();
    const id = (await params).id;
    const body = await request.json().catch(() => ({}));
    const proof_description = typeof body.proof_description === 'string' ? body.proof_description.slice(0, 2000) : null;
    const proof_url = typeof body.proof_url === 'string' ? body.proof_url.slice(0, 500) : null;

    const supabase = await createClient();
    const { data: challenge } = await supabase
      .from('developer_challenges')
      .select('id')
      .eq('id', id)
      .single();
    if (!challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });

    const { data: submission, error } = await supabase
      .from('challenge_submissions')
      .upsert(
        {
          challenge_id: id,
          user_id: context.user.id,
          organization_id: context.organization_id,
          proof_description,
          proof_url,
          status: 'pending',
        },
        { onConflict: 'challenge_id,user_id' }
      )
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ submission });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
