import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, ExternalLink, Globe } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';
import { APIDetailSubscribe, ChoosePlanButton } from '@/components/marketplace/APIDetailSubscribe';
import { ClaimButton } from '@/components/marketplace/ClaimButton';
import { FavoriteButton } from '@/components/marketplace/FavoriteButton';
import { ReviewForm } from '@/components/marketplace/ReviewForm';
import { ReportButton } from '@/components/reports/ReportButton';
import { getSimilarAPIs } from '@/lib/recommendations/engine';
import { RecommendedAPIs } from '@/components/marketplace/RecommendedAPIs';
import Link from 'next/link';

interface APIDetailPageProps {
  params: {
    org_slug: string;
    api_slug: string;
  };
}

export async function generateMetadata({ params }: APIDetailPageProps) {
  const supabase = await createClient();
  const { data: api } = await supabase
    .from('apis')
    .select('name, short_description')
    .eq('slug', params.api_slug)
    .single();

  return {
    title: api ? `${api.name} - API Marketplace` : 'API Not Found',
    description: api?.short_description || 'API details',
  };
}

export default async function APIDetailPage({ params }: APIDetailPageProps) {
  const supabase = await createClient();

  // Fetch API with all related data
  const { data: api, error } = await supabase
    .from('apis')
    .select(
      `
      *,
      organization:organizations!apis_organization_id_fkey(
        id, name, slug, logo_url, website, settings
      ),
      category:api_categories(name, slug),
      pricing_plans:api_pricing_plans(*),
      endpoints:api_endpoints(*),
      reviews:api_reviews(
        *, user:users(full_name, avatar_url)
      )
    `
    )
    .eq('slug', params.api_slug)
    .in('status', ['published', 'unclaimed'])
    .single();

  if (error || !api) {
    notFound();
  }

  const rating = api.avg_rating || 0;
  const reviewCount = api.total_reviews || 0;

  const similarAPIs = await getSimilarAPIs(api.id, api.category_id ?? null, 4);
  const visibleReviews = (api.reviews ?? []).filter((r: { hidden_at?: string | null }) => !r.hidden_at);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-6">
            {/* API Logo */}
            <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              {api.logo_url ? (
                <img
                  src={api.logo_url}
                  alt={api.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-4xl font-bold text-gray-400">
                  {api.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* API Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{api.name}</h1>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>by {api.organization?.name ?? 'Unknown'}</span>
                    {(api.organization as { settings?: { verified?: boolean } } | null)?.settings?.verified && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                        Verified provider
                      </Badge>
                    )}
                    {api.category && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary">{api.category.name}</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FavoriteButton apiId={api.id} apiName={api.name} initialFavorited={false} />
                  {api.status === 'unclaimed' ? (
                    <ClaimButton apiId={api.id} apiName={api.name} redirectUrl={`/marketplace/${params.org_slug}/${params.api_slug}`} />
                  ) : (
                    <APIDetailSubscribe
                      apiId={api.id}
                      apiName={api.name}
                      plans={(api.pricing_plans ?? []).map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        price_monthly: p.price_monthly ?? 0,
                        included_calls: p.included_calls,
                        rate_limit_per_minute: p.rate_limit_per_minute,
                        description: p.description,
                        features: p.features,
                      }))}
                    />
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{api.short_description}</p>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                {rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                    <span className="text-gray-500">({reviewCount} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>{api.total_subscribers || 0} subscribers</span>
                </div>
                {(api as { original_url?: string | null }).original_url && (
                  <a
                    href={(api as { original_url?: string | null }).original_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Official Documentation
                  </a>
                )}
                {api.organization?.website && (
                  <a
                    href={(api.organization as { website?: string }).website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">
              Endpoints ({api.endpoints?.length || 0})
            </TabsTrigger>
            {api.status !== 'unclaimed' && <TabsTrigger value="pricing">Pricing</TabsTrigger>}
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">About this API</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700">{api.description || api.short_description}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-card rounded-lg shadow-sm p-6 border">
                <div className="text-sm text-muted-foreground mb-1">Average Latency</div>
                <div className="text-2xl font-bold">
                  {api.settings?.avg_latency_ms ?? 'N/A'}
                  {api.settings?.avg_latency_ms != null && (
                    <span className="text-sm text-muted-foreground ml-1">ms</span>
                  )}
                </div>
              </div>
              <div className="bg-white dark:bg-card rounded-lg shadow-sm p-6 border">
                <div className="text-sm text-muted-foreground mb-1">Uptime</div>
                <div className="text-2xl font-bold">
                  {api.settings?.uptime_percentage ?? '99.9'}%
                </div>
              </div>
              <div className="bg-white dark:bg-card rounded-lg shadow-sm p-6 border">
                <div className="text-sm text-muted-foreground mb-1">Total Requests</div>
                <div className="text-2xl font-bold">
                  {(api.settings?.total_requests ?? 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* SLA & guarantees */}
            <div className="mt-6 rounded-lg border bg-white dark:bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">SLA & guarantees</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground font-medium">Uptime SLA</dt>
                  <dd className="font-semibold mt-0.5">
                    {(api.settings as { sla_uptime?: number } | null)?.sla_uptime ?? 99.9}%
                  </dd>
                  <dd className="text-muted-foreground text-xs mt-0.5">Monthly availability target</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium">Response time</dt>
                  <dd className="font-semibold mt-0.5">
                    p99 &lt; {(api.settings as { sla_response_ms?: number } | null)?.sla_response_ms ?? 500}ms
                  </dd>
                  <dd className="text-muted-foreground text-xs mt-0.5">Target latency guarantee</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium">Support</dt>
                  <dd className="font-semibold mt-0.5">
                    {(api.settings as { support_level?: string } | null)?.support_level ?? 'Standard'}
                  </dd>
                  <dd className="text-muted-foreground text-xs mt-0.5">Support level</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium">Credits</dt>
                  <dd className="font-semibold mt-0.5">
                    {(api.settings as { sla_credits?: string } | null)?.sla_credits ?? 'Service credits if SLA is missed'}
                  </dd>
                  <dd className="text-muted-foreground text-xs mt-0.5">SLA breach remedy</dd>
                </div>
              </dl>
              <p className="text-xs text-muted-foreground mt-4">
                See status page for live uptime and incident history.
              </p>
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <Link href={`/marketplace/${params.org_slug}/${params.api_slug}/status`}>
                  View status page
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints">
            <div className="bg-white rounded-lg shadow-sm divide-y">
              {api.endpoints && api.endpoints.length > 0 ? (
                api.endpoints.map((endpoint: any) => (
                  <div key={endpoint.id} className="p-6">
                    <div className="flex items-start gap-3">
                      <Badge
                        variant={
                          endpoint.method === 'GET'
                            ? 'default'
                            : endpoint.method === 'POST'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="font-mono"
                      >
                        {endpoint.method}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-mono text-sm text-gray-900 mb-1">
                          {endpoint.path}
                        </div>
                        {endpoint.description && (
                          <p className="text-sm text-gray-600">{endpoint.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-500">
                  No endpoints documented yet
                </div>
              )}
            </div>
          </TabsContent>

          {/* Pricing Tab - hidden for unclaimed APIs */}
          {api.status !== 'unclaimed' && (
          <TabsContent value="pricing">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {api.pricing_plans && api.pricing_plans.length > 0 ? (
                api.pricing_plans.map((plan: any) => (
                  <div
                    key={plan.id}
                    className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200 hover:border-blue-500 transition-colors"
                  >
                    <div className="text-lg font-semibold mb-2">{plan.name}</div>
                    <div className="text-3xl font-bold mb-4">
                      {plan.price_monthly === 0 ? (
                        'Free'
                      ) : (
                        <>
                          {formatCurrency(plan.price_monthly)}
                          <span className="text-sm text-gray-500 font-normal">/mo</span>
                        </>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    )}
                    <ul className="space-y-2 mb-6 text-sm">
                      <li>✓ {plan.included_calls?.toLocaleString() || 'Unlimited'} API calls</li>
                      <li>✓ {plan.rate_limit_per_minute || 100} requests/min</li>
                      {plan.features?.map((feature: string, i: number) => (
                        <li key={i}>✓ {feature}</li>
                      ))}
                    </ul>
                    <ChoosePlanButton
                        apiId={api.id}
                        apiName={api.name}
                        plans={(api.pricing_plans ?? []).map((p: any) => ({
                          id: p.id,
                          name: p.name,
                          price_monthly: p.price_monthly ?? 0,
                          included_calls: p.included_calls,
                          rate_limit_per_minute: p.rate_limit_per_minute,
                          description: p.description,
                          features: p.features,
                        }))}
                        planId={plan.id}
                      />
                  </div>
                ))
              ) : (
                <div className="col-span-3 bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                  Pricing information will be available soon
                </div>
              )}
            </div>
          </TabsContent>
          )}

          {/* Documentation Tab */}
          <TabsContent value="docs">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">API Documentation</h2>
              <p className="text-gray-600 mb-4">
                {(api as { original_url?: string | null }).original_url
                  ? 'Official documentation for this API is available at the link below.'
                  : 'Complete API documentation is available after subscribing.'}
              </p>
              <Button asChild>
                <a
                  href={
                    (api as { original_url?: string | null }).original_url ??
                    `/docs/${params.org_slug}/${params.api_slug}`
                  }
                  target={(api as { original_url?: string | null }).original_url ? '_blank' : undefined}
                  rel={(api as { original_url?: string | null }).original_url ? 'noopener noreferrer' : undefined}
                >
                  {(api as { original_url?: string | null }).original_url
                    ? 'Official Documentation'
                    : 'View Full Documentation'}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-6">
              <ReviewForm apiId={api.id} />
              <div className="space-y-4">
                {visibleReviews.length > 0 ? (
                  visibleReviews.map((review: { id: string; user?: { full_name?: string }; rating: number; body?: string | null; title?: string | null }) => (
                    <div key={review.id} className="bg-white dark:bg-card rounded-lg shadow-sm p-6 border">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{review.user?.full_name || 'Anonymous'}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300 dark:text-muted-foreground/40'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.title && (
                            <p className="font-medium text-foreground mb-1">{review.title}</p>
                          )}
                          <p className="text-muted-foreground">{review.body || '—'}</p>
                        </div>
                        <ReportButton resourceType="api_review" resourceId={review.id} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-card rounded-lg border p-12 text-center text-muted-foreground">
                    No reviews yet. Be the first to review this API!
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-700 mb-4">
                View uptime, latency, and incident history for this API.
              </p>
              <Button asChild>
                <Link href={`/marketplace/${params.org_slug}/${params.api_slug}/status`}>
                  Open status page
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Similar APIs */}
        {similarAPIs.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t bg-white mt-8">
            <RecommendedAPIs apis={similarAPIs} title="Similar APIs" />
          </div>
        )}
      </div>
    </div>
  );
}
