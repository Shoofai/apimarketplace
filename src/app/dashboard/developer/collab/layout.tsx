import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { FeatureGate } from '@/components/dashboard/FeatureGate';

export default async function CollabLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: userData } = await supabase
    .from('users')
    .select('current_organization_id, organizations:current_organization_id(plan)')
    .eq('id', user.id)
    .single();

  const org = Array.isArray(userData?.organizations)
    ? userData.organizations[0]
    : userData?.organizations;
  const currentPlan = (org as { plan?: string } | null)?.plan ?? 'free';

  return (
    <FeatureGate
      requiredPlan="pro"
      currentPlan={currentPlan}
      featureName="Collaborative Testing"
      description="Test APIs together with your team in real-time. Available on the Pro plan."
    >
      {children}
    </FeatureGate>
  );
}
