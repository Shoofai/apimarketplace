import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Calendar, FileQuestion, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ClaimReviewActions } from '../ClaimReviewActions';

export default async function APIClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', authUser.id)
    .single();

  if (!adminUser?.is_platform_admin) {
    redirect('/dashboard');
  }

  const { data: api, error } = await supabase
    .from('apis')
    .select(
      `
      *,
      organization:organizations!apis_organization_id_fkey(id, name, slug),
      claiming_org:organizations!apis_claimed_by_organization_id_fkey(id, name, slug, type)
    `
    )
    .eq('id', id)
    .single();

  if (error || !api) {
    notFound();
  }

  if (api.status !== 'claim_pending') {
    redirect('/dashboard/admin/apis/claims');
  }

  const org = api.organization as { id: string; name: string; slug: string } | null;
  const claimingOrg = api.claiming_org as { id: string; name: string; slug: string; type: string } | null;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/apis/claims">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileQuestion className="h-6 w-6" />
              Review API Claim
            </h1>
            <p className="text-muted-foreground">Approve or reject this claim request</p>
          </div>
        </div>
        <ClaimReviewActions apiId={api.id} apiName={api.name} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {api.name}
                <Badge variant="default">Claim Pending</Badge>
              </CardTitle>
              {api.description && (
                <CardDescription className="mt-2 text-base">{api.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4" />
                Current Owner (Platform)
              </h3>
              <p className="font-medium">{org?.name ?? 'API Directory'}</p>
              <p className="text-sm text-muted-foreground">{org?.slug}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4" />
                Claiming Organization
              </h3>
              <p className="font-medium">{claimingOrg?.name ?? '—'}</p>
              <p className="text-sm text-muted-foreground">{claimingOrg?.slug} • {claimingOrg?.type ?? 'provider'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4" />
              Claim Requested
            </h3>
            <p>{api.claim_requested_at ? new Date(api.claim_requested_at).toLocaleString() : '—'}</p>
          </div>

          {api.base_url && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Base URL</h3>
              <p className="font-mono text-sm break-all">{api.base_url}</p>
            </div>
          )}

          {(api as { original_url?: string | null }).original_url && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Official Documentation</h3>
              <a
                href={(api as { original_url: string }).original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                {(api as { original_url: string }).original_url}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
