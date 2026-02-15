import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileQuestion, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function APIClaimsQueuePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    redirect('/dashboard');
  }

  const { data: claimAPIs } = await supabase
    .from('apis')
    .select(
      `
      id,
      name,
      slug,
      description,
      claim_requested_at,
      organization:organizations!apis_organization_id_fkey(name, slug),
      claiming_org:organizations!apis_claimed_by_organization_id_fkey(id, name, slug)
    `
    )
    .eq('status', 'claim_pending')
    .order('claim_requested_at', { ascending: false });

  const count = claimAPIs?.length ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileQuestion className="h-8 w-8" />
            API Claims
          </h1>
          <p className="text-muted-foreground">
            Review and approve provider claims for unclaimed APIs
          </p>
        </div>
        <Badge variant={count > 0 ? 'default' : 'secondary'}>
          {count} Pending
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Claims</CardTitle>
          <CardDescription>
            APIs requested by providers. Approve to transfer ownership, or reject to return to unclaimed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!claimAPIs || claimAPIs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No pending API claims</p>
            </div>
          ) : (
            <div className="space-y-4">
              {claimAPIs.map((api: { id: string; name: string; claim_requested_at: string | null; claiming_org?: { name: string } | { name: string }[] | null }) => {
                const claimingOrg = Array.isArray(api.claiming_org) ? api.claiming_org[0] : api.claiming_org;
                return (
                <div
                  key={api.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{api.name}</h3>
                      <Badge variant="outline">Claim Pending</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Claimed by <strong>{claimingOrg?.name ?? 'Unknown'}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Requested {api.claim_requested_at ? new Date(api.claim_requested_at).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <Link href={`/dashboard/admin/apis/claims/${api.id}`}>
                    <Button>Review</Button>
                  </Link>
                </div>
              );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
