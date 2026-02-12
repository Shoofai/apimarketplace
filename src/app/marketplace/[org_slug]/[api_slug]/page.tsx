import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, ExternalLink, Globe } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';

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
        id, name, slug, logo_url, website
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
    .eq('status', 'published')
    .single();

  if (error || !api) {
    notFound();
  }

  const rating = api.avg_rating || 0;
  const reviewCount = api.total_reviews || 0;

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
                    <span>by {api.organization.name}</span>
                    {api.category && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary">{api.category.name}</Badge>
                      </>
                    )}
                  </div>
                </div>
                <Button size="lg">Subscribe</Button>
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
                {api.organization.website && (
                  <a
                    href={api.organization.website}
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
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">Average Latency</div>
                <div className="text-2xl font-bold">
                  {api.settings?.avg_latency_ms || 'N/A'}
                  {api.settings?.avg_latency_ms && (
                    <span className="text-sm text-gray-500 ml-1">ms</span>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">Uptime</div>
                <div className="text-2xl font-bold">
                  {api.settings?.uptime_percentage || '99.9'}%
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">Total Requests</div>
                <div className="text-2xl font-bold">
                  {(api.settings?.total_requests || 0).toLocaleString()}
                </div>
              </div>
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

          {/* Pricing Tab */}
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
                    <Button className="w-full">Choose Plan</Button>
                  </div>
                ))
              ) : (
                <div className="col-span-3 bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                  Pricing information will be available soon
                </div>
              )}
            </div>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">API Documentation</h2>
              <p className="text-gray-600 mb-4">
                Complete API documentation is available after subscribing.
              </p>
              <Button asChild>
                <a href={`/docs/${params.org_slug}/${params.api_slug}`}>
                  View Full Documentation
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-4">
              {api.reviews && api.reviews.length > 0 ? (
                api.reviews.map((review: any) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.user?.full_name || 'Anonymous'}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                  No reviews yet. Be the first to review this API!
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
