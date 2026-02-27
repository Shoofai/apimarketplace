import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/credits
 * Returns current credit balance, last 20 ledger rows, and available packages.
 */
export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const [balanceRes, ledgerRes, packagesRes] = await Promise.all([
      supabase
        .from('credit_balances')
        .select('balance, updated_at')
        .eq('organization_id', context.organization_id)
        .maybeSingle(),
      supabase
        .from('credit_ledger')
        .select('*')
        .eq('organization_id', context.organization_id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('credits', { ascending: true }),
    ]);

    return NextResponse.json({
      balance: balanceRes.data?.balance ?? 0,
      updated_at: balanceRes.data?.updated_at ?? null,
      ledger: ledgerRes.data ?? [],
      packages: packagesRes.data ?? [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
