import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BillingClient } from './BillingClient';

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select(`
      id,
      organizations:current_organization_id (
        id,
        name,
        plan
      )
    `)
    .eq('id', user.id)
    .single();

  const org = userData?.organizations as any;

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, billing_period_start, billing_period_end, total, status, stripe_invoice_id, paid_at, due_date')
    .eq('organization_id', org?.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <BillingClient
      plan={org?.plan ?? 'free'}
      orgId={org?.id ?? ''}
      invoices={invoices ?? []}
    />
  );
}
