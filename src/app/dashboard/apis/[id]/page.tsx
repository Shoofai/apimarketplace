import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Users,
  BarChart3,
  FileText,
  Settings,
  DollarSign,
  TrendingUp,
  Clock,
  Globe,
  Code2,
} from 'lucide-react';
import Link from 'next/link';

interface APIDetailPageProps {
  params: {
    id: string;
  };
}

export default async function APIDetailPage({ params }: APIDetailPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select(`
      id,
      current_organization_id,
      organizations:current_organization_id (
        id,
        type
      )
    `)
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect('/login');
  }

  const org = userData.organizations as any;

  // Get API details
  const { data: api, error } = await supabase
    .from('apis')
    .select(`
      id,
      name,
      slug,
      description,
      version,
      status,
      created_at,
      updated_at,
      openapi_spec,
      categories,
      organization_id,
      organizations:organization_id (
        id,
        name,
        slug
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !api) {
    notFound();
  }

  // Check if user owns this API
  if (api.organization_id !== org.id) {
    redirect('/dashboard/apis');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/apis">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{api.name}</h1>
            <Badge variant={api.status === 'published' ? 'default' : 'secondary'}>
              {api.status.charAt(0).toUpperCase() + api.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {api.description || 'No description provided'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/docs/${api.slug}`}>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Documentation
            </Button>
          </Link>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards apiId={params.id} />
      </Suspense>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Version</div>
                  <div className="font-medium">{api.version || '1.0.0'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <Badge variant={api.status === 'published' ? 'default' : 'secondary'}>
                    {api.status.charAt(0).toUpperCase() + api.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Created</div>
                  <div className="font-medium">
                    {new Date(api.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Last Updated</div>
                  <div className="font-medium">
                    {new Date(api.updated_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/docs/${api.slug}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    View Documentation
                  </Button>
                </Link>
                <Link href={`/marketplace/${(api.organizations as any)?.slug}/${api.slug}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    View in Marketplace
                  </Button>
                </Link>
                <Link href={`/dashboard/sandbox?api=${api.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Code2 className="h-4 w-4 mr-2" />
                    Test in Sandbox
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-6">
          <Suspense fallback={<SubscribersListSkeleton />}>
            <SubscribersList apiId={params.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center text-muted-foreground">
              Analytics dashboard coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                All available endpoints from OpenAPI specification
              </CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center text-muted-foreground">
              Endpoint documentation coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Tiers</CardTitle>
              <CardDescription>
                Manage subscription plans and pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center text-muted-foreground">
              Pricing management coming soon
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function StatsCards({ apiId }: { apiId: string }) {
  const supabase = await createClient();

  // Get subscriber count
  const { count: subscriberCount } = await supabase
    .from('api_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('api_id', apiId)
    .eq('status', 'active');

  // Get total API calls (mock for now)
  const totalCalls = 0;
  const revenue = 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Subscribers
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{subscriberCount || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all plans
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total API Calls
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalCalls}</div>
          <p className="text-xs text-muted-foreground mt-1">
            This month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Revenue
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${revenue}</div>
          <p className="text-xs text-muted-foreground mt-1">
            vs. last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Response Time
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">0ms</div>
          <p className="text-xs text-muted-foreground mt-1">
            Last 24 hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

async function SubscribersList({ apiId }: { apiId: string }) {
  const supabase = await createClient();

  const { data: subscriptions } = await supabase
    .from('api_subscriptions')
    .select(`
      id,
      plan,
      status,
      created_at,
      organization:organization_id (
        id,
        name,
        slug
      )
    `)
    .eq('api_id', apiId)
    .order('created_at', { ascending: false });

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No subscribers yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscribers</CardTitle>
        <CardDescription>
          {subscriptions.length} active subscription{subscriptions.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {((sub.organization as any)?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{(sub.organization as any)?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                  {sub.plan}
                </Badge>
                <Badge variant="outline">{sub.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-20 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SubscribersListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
