import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { getCostIntelligence } from '@/lib/analytics/cost-intelligence';
import { AuthError } from '@/lib/utils/errors';

/**
 * GET /api/analytics/cost-intelligence?range=7d|30d|90d
 */
export async function GET(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    const data = await getCostIntelligence(supabase, context.organization_id, range);
    return NextResponse.json(data);
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
