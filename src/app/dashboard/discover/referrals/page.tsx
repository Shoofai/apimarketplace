import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import { ReferralDashboard } from './ReferralDashboard';

export default async function ReferralsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: referrals } = await supabase
    .from('referrals')
    .select('id, referred_email, code, status, created_at')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(DEFAULT_LIST_LIMIT);

  const signedUp = (referrals ?? []).filter((r: { status: string }) => r.status === 'signed_up').length;
  const shareCode = user.id.slice(0, 8) + '-ref';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6" />
          Referral program
        </h1>
        <p className="text-muted-foreground">Invite friends and earn rewards</p>
      </div>
      <ReferralDashboard
        referrals={referrals ?? []}
        signedUpCount={signedUp}
        shareCode={shareCode}
      />
    </div>
  );
}
