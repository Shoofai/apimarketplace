import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Tag, Calendar, Box, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { APIReviewActions } from './APIReviewActions';

interface ReviewScore {
  overall_score: number;
  spec_completeness: number;
  docs_coverage: number;
  error_handling: number;
  versioning: number;
  summary: string;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 75 ? 'bg-green-500'
    : value >= 50 ? 'bg-yellow-500'
    : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default async function APIReviewDetailPage({
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
      organizations(id, name, type, plan, slug),
      categories(id, name),
      api_review_scores(overall_score, spec_completeness, docs_coverage, error_handling, versioning, summary)
    `
    )
    .eq('id', id)
    .single();

  if (error || !api) {
    notFound();
  }

  const canReview = api.status === 'draft' || api.status === 'in_review';
  const org = api.organizations as any;
  const category = api.categories as any;
  const scoreRow = (api as any).api_review_scores;
  const reviewScore: ReviewScore | null = Array.isArray(scoreRow)
    ? (scoreRow[0] ?? null)
    : (scoreRow ?? null);

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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Box className="h-6 w-6" />
              Review API
            </h1>
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
              <CardTitle className="text-base flex items-center gap-2">
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

      {/* AI Quality Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            AI Quality Score
            {reviewScore && (
              <Badge
                variant="outline"
                className={
                  reviewScore.overall_score >= 75
                    ? 'border-green-500/30 text-green-700 dark:text-green-400'
                    : reviewScore.overall_score >= 50
                    ? 'border-yellow-500/30 text-yellow-700 dark:text-yellow-400'
                    : 'border-red-500/30 text-red-700 dark:text-red-400'
                }
              >
                {reviewScore.overall_score}/100
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Automated assessment of spec completeness, documentation, error handling, and versioning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviewScore ? (
            <div className="space-y-4">
              <ScoreBar label="Spec Completeness" value={reviewScore.spec_completeness} />
              <ScoreBar label="Documentation Coverage" value={reviewScore.docs_coverage} />
              <ScoreBar label="Error Handling" value={reviewScore.error_handling} />
              <ScoreBar label="Versioning" value={reviewScore.versioning} />
              {reviewScore.summary && (
                <p className="mt-4 text-sm text-muted-foreground border-t pt-3">{reviewScore.summary}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No AI score yet.</p>
              <p className="text-xs mt-1">Score is generated when the provider submits for review.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
