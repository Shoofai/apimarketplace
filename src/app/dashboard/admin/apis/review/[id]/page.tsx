import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Tag, Calendar } from 'lucide-react';
import Link from 'next/link';
import { APIReviewActions } from './APIReviewActions';

export default async function APIReviewDetailPage({
  params,
}: {
  params: { id: string };
}) {
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
      organizations(id, name, type, plan, slug),
      categories(id, name)
    `
    )
    .eq('id', params.id)
    .single();

  if (error || !api) {
    notFound();
  }

  const canReview = api.status === 'draft' || api.status === 'in_review';
  const org = api.organizations as any;
  const category = api.categories as any;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/apis/review">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Review API</h1>
            <p className="text-muted-foreground">Approve or reject API submission</p>
          </div>
        </div>
        {canReview && (
          <APIReviewActions apiId={api.id} apiName={api.name} />
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                {api.name}
                <Badge variant={api.status === 'in_review' ? 'default' : 'secondary'}>
                  {api.status}
                </Badge>
                {org?.plan === 'enterprise' && (
                  <Badge variant="outline">Enterprise</Badge>
                )}
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
                Organization
              </h3>
              <p className="font-medium">{org?.name ?? '—'}</p>
              <p className="text-sm text-muted-foreground">{org?.slug} • {org?.type} • {org?.plan}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Tag className="h-4 w-4" />
                Category
              </h3>
              <p className="font-medium">{category?.name ?? '—'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4" />
              Submitted
            </h3>
            <p>{new Date(api.created_at).toLocaleString()}</p>
          </div>

          {api.base_url && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Base URL</h3>
              <p className="font-mono text-sm break-all">{api.base_url}</p>
            </div>
          )}

          {api.version && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Version</h3>
              <p>{api.version}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
