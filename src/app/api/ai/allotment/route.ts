import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { getAIAllotmentStatus } from '@/lib/ai/allotment';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/ai/allotment
 * Returns the current org's daily AI allotment usage and credit balance.
 * Used by the AI playground to show "X/50 free generations used today".
 */
export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', context.organization_id)
      .single();

    const plan = org?.plan ?? 'free';
    const status = await getAIAllotmentStatus(context.organization_id, plan);

    return NextResponse.json(status);
  } catch (error) {
    logger.error('Error fetching AI allotment status', { error });
    return NextResponse.json(
      { error: 'Failed to fetch allotment status' },
      { status: 500 }
    );
  }
}
