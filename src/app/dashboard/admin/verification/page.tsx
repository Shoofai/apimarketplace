import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Building2, Clock } from 'lucide-react';
import Link from 'next/link';
import { ProviderVerificationActions } from './ProviderVerificationActions';

export default async function ProviderVerificationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) redirect('/dashboard');

  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, slug, type, website, created_at, settings')
    .in('type', ['provider', 'both'])
    .order('created_at', { ascending: false });

  const verified = (settings: unknown): boolean => {
    if (settings && typeof settings === 'object' && 'verified' in settings) {
      return (settings as { verified?: boolean }).verified === true;
    }
    return false;
  };

  const pending = (orgs ?? []).filter((o) => !verified(o.settings));
  const verifiedCount = (orgs ?? []).filter((o) => verified(o.settings)).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckCircle className="h-8 w-8" />
          Provider verification
        </h1>
          <p className="text-muted-foreground">Approve or reject provider organizations</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{pending.length} Pending</Badge>
          <Badge variant="default">{verifiedCount} Verified</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedCount}</div>
            <p className="text-xs text-muted-foreground">Provider organizations</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue</CardTitle>
          <CardDescription>Review and verify provider organizations</CardDescription>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-muted-foreground text-sm">No providers pending verification.</p>
          ) : (
            <div className="space-y-4">
              {pending.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {org.slug} · {org.type}
                        {org.website && ` · ${org.website}`}
                      </p>
                    </div>
                  </div>
                  <ProviderVerificationActions organizationId={org.id} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

