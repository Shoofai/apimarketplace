import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Key } from 'lucide-react';
import Link from 'next/link';
import { ApiKeysClient } from './ApiKeysClient';

export default async function APIKeysPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('id, current_organization_id')
    .eq('id', user.id)
    .single();

  if (!userData) redirect('/dashboard');

  // Fetch real subscriptions with API info — prefix only (key hash is never returned)
  const { data: subscriptions } = await supabase
    .from('api_subscriptions')
    .select(`
      id,
      api_key_prefix,
      status,
      created_at,
      current_period_end,
      api:apis(id, name, slug, organization:organizations!apis_organization_id_fkey(slug)),
      pricing_plan:api_pricing_plans(name)
    `)
    .eq('organization_id', userData.current_organization_id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <Link href="/dashboard/settings">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Key className="h-6 w-6" />
          API Keys
        </h1>
        <p className="text-muted-foreground">
          One API key per subscription. Use Rotate to generate a new key and invalidate the old one.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Subscription Keys</CardTitle>
          <CardDescription>
            Keys are shown by prefix only. Use Rotate to get a new plaintext key — it will only be shown once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeysClient subscriptions={(subscriptions ?? []) as any} />
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <CardHeader>
          <CardTitle className="text-base">Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Never share your API keys publicly or commit them to version control</li>
            <li>Use environment variables or a secrets manager (e.g. Vercel, Doppler)</li>
            <li>Rotate keys immediately if you suspect a leak</li>
            <li>Revoke keys for subscriptions you no longer use</li>
            <li>Monitor usage in <Link href="/dashboard/analytics/usage" className="text-primary hover:underline">Analytics</Link> for anomalies</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
