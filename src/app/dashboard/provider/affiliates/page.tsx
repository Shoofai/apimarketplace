import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';

export default async function ProviderAffiliatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase.from('users').select('current_organization_id').eq('id', user.id).single();
  const orgId = (userData as { current_organization_id?: string } | null)?.current_organization_id;
  if (!orgId) {
    return (
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Affiliate program
        </h1>
        <p className="text-muted-foreground">Select an organization to manage affiliate links.</p>
      </div>
    );
  }

  const { data: link } = await supabase
    .from('affiliate_links')
    .select('id, code, commission_percent')
    .eq('organization_id', orgId)
    .maybeSingle();

  const code = link?.code ?? orgId.slice(0, 8) + '-aff';
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com';
  const affiliateUrl = `${origin}/marketplace?aff=${code}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Affiliate program
        </h1>
        <p className="text-muted-foreground">Share your link. Earn commission when developers subscribe to your APIs.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your affiliate link</CardTitle>
          <CardDescription>Share this link. You earn {(link as { commission_percent?: number } | null)?.commission_percent ?? 5}% on referred subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm break-all bg-muted p-3 rounded">{affiliateUrl}</p>
          <p className="text-xs text-muted-foreground mt-2">Copy the link above and share it to earn commission on referred subscriptions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
