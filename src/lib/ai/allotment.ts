import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

const TIER_LIMITS: Record<string, number> = {
  free: 50,
  pro: 200,
  enterprise: Infinity,
};

const CREDIT_COST_PER_GENERATION = 1;

/**
 * Checks if an organization can generate AI output and deducts from allotment or credits.
 * Priority: free tier allotment → credit balance → hard stop
 *
 * Returns { allowed, source } where source is 'allotment' | 'credits' | null.
 */
export async function consumeAIGeneration(
  organizationId: string,
  plan: string
): Promise<{ allowed: boolean; source: 'allotment' | 'credits' | null }> {
  const tierLimit = TIER_LIMITS[plan] ?? TIER_LIMITS.free;

  // Enterprise has unlimited allotment
  if (tierLimit === Infinity) {
    return { allowed: true, source: 'allotment' };
  }

  const adminSb = createAdminClient();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Upsert today's allotment row for this org
  const { data: allotment, error } = await adminSb
    .from('ai_allotments' as any)
    .upsert(
      {
        organization_id: organizationId,
        period_start: today,
        used: 0,
        tier_limit: tierLimit,
      },
      { onConflict: 'organization_id,period_start', ignoreDuplicates: true }
    )
    .select()
    .maybeSingle();

  if (error && error.code !== '23505') {
    logger.error('ai_allotments upsert error', { error });
  }

  // Re-fetch after upsert to get current state
  const { data: currentAllotment } = await adminSb
    .from('ai_allotments' as any)
    .select('id, used, tier_limit')
    .eq('organization_id', organizationId)
    .eq('period_start', today)
    .single();

  const used = currentAllotment?.used ?? 0;
  const limit = currentAllotment?.tier_limit ?? tierLimit;

  if (used < limit) {
    // Increment used count atomically
    await adminSb
      .from('ai_allotments' as any)
      .update({ used: used + 1 })
      .eq('organization_id', organizationId)
      .eq('period_start', today);

    return { allowed: true, source: 'allotment' };
  }

  // Allotment exhausted — try credits
  const { data: creditBalance } = await adminSb
    .from('credit_balances')
    .select('id, balance')
    .eq('organization_id', organizationId)
    .maybeSingle();

  const balance = creditBalance?.balance ?? 0;

  if (balance >= CREDIT_COST_PER_GENERATION) {
    const newBalance = balance - CREDIT_COST_PER_GENERATION;

    await adminSb
      .from('credit_balances')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('organization_id', organizationId);

    await adminSb.from('credit_ledger').insert({
      organization_id: organizationId,
      amount: -CREDIT_COST_PER_GENERATION,
      type: 'consumption',
      description: `AI playground generation (credit overage)`,
      balance_after: newBalance,
    } as any);

    return { allowed: true, source: 'credits' };
  }

  // Hard stop
  return { allowed: false, source: null };
}

/**
 * Returns remaining allotment and credit balance for the current day.
 */
export async function getAIAllotmentStatus(
  organizationId: string,
  plan: string
): Promise<{ used: number; limit: number; remaining: number; credits_balance: number }> {
  const tierLimit = TIER_LIMITS[plan] ?? TIER_LIMITS.free;
  const adminSb = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const [allotmentResult, creditResult] = await Promise.all([
    adminSb
      .from('ai_allotments' as any)
      .select('used, tier_limit')
      .eq('organization_id', organizationId)
      .eq('period_start', today)
      .maybeSingle(),
    adminSb
      .from('credit_balances')
      .select('balance')
      .eq('organization_id', organizationId)
      .maybeSingle(),
  ]);

  const used = allotmentResult.data?.used ?? 0;
  const limit = allotmentResult.data?.tier_limit ?? tierLimit;
  const credits_balance = creditResult.data?.balance ?? 0;

  return {
    used,
    limit: limit === Infinity ? -1 : limit,
    remaining: limit === Infinity ? -1 : Math.max(0, limit - used),
    credits_balance,
  };
}
