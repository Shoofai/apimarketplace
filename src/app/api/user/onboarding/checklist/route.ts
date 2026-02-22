import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

/**
 * GET /api/user/onboarding/checklist - Get onboarding checklist progress
 */
export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const [{ count: subCount }, { count: teamCount }] = await Promise.all([
      supabase
        .from('api_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', context.organization_id)
        .eq('status', 'active'),
      supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', context.organization_id),
    ]);

    const items = [
      { id: 'subscribe', label: 'Subscribe to your first API', href: '/marketplace', done: (subCount ?? 0) > 0 },
      { id: 'sandbox', label: 'Test an API in Sandbox', href: '/dashboard/developer/sandbox', done: false },
      { id: 'ai', label: 'Generate code with AI', href: '/dashboard/developer/playground', done: false },
      { id: 'team', label: 'Invite a team member', href: '/dashboard/settings/team', done: (teamCount ?? 0) > 1 },
    ];

    return NextResponse.json({ items });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
