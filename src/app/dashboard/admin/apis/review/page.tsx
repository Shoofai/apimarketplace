import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Box, Clock, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

import Link from 'next/link';

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const color =
    score >= 75 ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
    : score >= 50 ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
    : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${color}`}>
      <Sparkles className="h-3 w-3" />
      AI {score}/100
    </span>
  );
}

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
    .eq('id', user.id)
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
      pricing_plans(count),
      api_review_scores(overall_score)
    `
    )
    .in('status', ['draft', 'in_review'])
    .order('created_at', { ascending: false })
    .limit(DEFAULT_LIST_LIMIT);

  const pendingCount = reviewAPIs?.filter((api) => api.status === 'in_review').length || 0;
  const draftCount = reviewAPIs?.filter((api) => api.status === 'draft').length || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Box className="h-6 w-6" />
            API Review Queue
          </h1>
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
            <div className="text-xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground">Not yet submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
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
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold">{api.name}</h3>
                      <Badge
                        variant={api.status === 'in_review' ? 'default' : 'secondary'}
                      >
                        {api.status}
                      </Badge>
                      {api.organizations?.plan === 'enterprise' && (
                        <Badge variant="outline">⭐ Enterprise</Badge>
                      )}
                      {(() => {
                        const scoreRow = (api as any).api_review_scores;
                        const score = Array.isArray(scoreRow)
                          ? scoreRow[0]?.overall_score
                          : scoreRow?.overall_score;
                        return <ScoreBadge score={score ?? null} />;
                      })()}
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
