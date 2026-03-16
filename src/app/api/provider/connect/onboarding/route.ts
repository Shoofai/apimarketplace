import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createConnectAccount, refreshConnectOnboarding } from '@/lib/stripe/connect';
import { NextResponse } from 'next/server';

/**
 * Returns Stripe Connect onboarding URL for the current user's organization.
 * Creates a Connect Express account if one does not exist; otherwise returns a refresh link.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('current_organization_id')
    .eq('id', user.id)
    .single();

  const orgId = userData?.current_organization_id as string | null;
  if (!orgId) {
    return NextResponse.json(
      { error: 'No organization selected. Create or select an organization first.' },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminClient();
    const { data: billing } = await admin
      .from('billing_accounts')
      .select('stripe_connect_account_id')
      .eq('organization_id', orgId)
      .maybeSingle();

    const existingAccountId = billing?.stripe_connect_account_id as string | null;
    if (existingAccountId) {
      const { onboardingUrl } = await refreshConnectOnboarding(existingAccountId);
      return NextResponse.json({ onboardingUrl });
    }

    const { onboardingUrl } = await createConnectAccount(orgId, user.email, 'US');
    return NextResponse.json({ onboardingUrl });
  } catch (e) {
    console.error('Connect onboarding error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to start Stripe Connect' },
      { status: 500 }
    );
  }
}
