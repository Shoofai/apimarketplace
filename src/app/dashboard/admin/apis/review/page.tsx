import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function APIReviewQueuePage() {
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
    .eq('auth_id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    redirect('/dashboard');
  }

  // Get APIs in review status
  const { data: reviewAPIs } = await supabase
    .from('apis')
    .select(
      `
      *,
      organizations(name, type, plan),
      categories(name),
      pricing_plans(count)
    `
    )
    .in('status', ['draft', 'in_review'])
    .order('created_at', { ascending: false });

  const pendingCount = reviewAPIs?.filter((api) => api.status === 'in_review').length || 0;
  const draftCount = reviewAPIs?.filter((api) => api.status === 'draft').length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Review Queue</h1>
          <p className="text-muted-foreground">Review and approve API submissions</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">
            {draftCount} Drafts
          </Badge>
          <Badge variant="default">
            {pendingCount} In Review
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground">Not yet submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviewAPIs?.filter((api) => api.status === 'published').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Live APIs</p>
          </CardContent>
        </Card>
      </div>

      {/* Review List */}
      <Card>
        <CardHeader>
          <CardTitle>APIs Pending Review</CardTitle>
          <CardDescription>Click on an API to review details and take action</CardDescription>
        </CardHeader>
        <CardContent>
          {!reviewAPIs || reviewAPIs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No APIs pending review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewAPIs.map((api) => (
                <div
                  key={api.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{api.name}</h3>
                      <Badge
                        variant={api.status === 'in_review' ? 'default' : 'secondary'}
                      >
                        {api.status}
                      </Badge>
                      {api.organizations?.plan === 'enterprise' && (
                        <Badge variant="outline">⭐ Enterprise</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {api.organizations?.name} • {api.categories?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted {new Date(api.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/admin/apis/review/${api.id}`}>
                      <Button>Review</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
