import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Scale } from 'lucide-react';
import { GovernanceClient } from './GovernanceClient';

export const metadata = { title: 'Governance | Settings' };

export default async function GovernancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Scale className="h-6 w-6" />
          API Governance
        </h1>
        <p className="text-muted-foreground mt-1">
          Define spend caps, approved API allowlists, and rate limit overrides for your organization.
        </p>
      </div>
      <GovernanceClient />
    </div>
  );
}
