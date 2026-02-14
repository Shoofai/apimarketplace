import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { getDeveloperAnalytics } from '@/lib/analytics/developer';
import { AuthError } from '@/lib/utils/errors';

export async function GET(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const subscription_id = searchParams.get('subscription_id') || 'all';

    const data = await getDeveloperAnalytics(
      supabase,
      context.organization_id,
      range,
      subscription_id === 'all' ? null : subscription_id
    );
    return NextResponse.json(data);
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
