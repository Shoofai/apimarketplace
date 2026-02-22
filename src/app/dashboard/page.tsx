import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { getRecommendations } from '@/lib/recommendations/engine';
import { RecommendedAPIs } from '@/components/marketplace/RecommendedAPIs';
import { DashboardOnboarding } from '@/components/onboarding/DashboardOnboarding';
import {
  Activity,
  Box,
  BarChart3,
  Code2,
  Crown,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user data with organization
  const { data: userData } = await supabase
    .from('users')
    .select(`
      id,
      email,
      full_name,
      is_platform_admin,
      current_organization_id,
      organizations:current_organization_id (
        id,
        name,
        slug,
        type,
        plan
      )
    `)
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect('/login');
  }

  const org = userData.organizations as any;
  const isAdmin = userData.is_platform_admin;
  const isProvider = org?.type === 'provider' || org?.type === 'both';
  const isConsumer = org?.type === 'consumer' || org?.type === 'both';

  const recommendations = isConsumer ? await getRecommendations(6) : [];

  return (
    <div className="space-y-8">
      <DashboardOnboarding />
      <PageHeader
        title={`Welcome back, ${userData.full_name}`}
        description={
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="text-base">{org?.name}</span>
            <span className="text-muted-foreground/50">•</span>
            <Badge variant="outline" className="text-xs font-medium border-primary/30 text-primary">
              {org?.plan.charAt(0).toUpperCase() + org?.plan.slice(1)} Plan
            </Badge>
          </div>
        }
        icon={isAdmin ? Crown : undefined}
        actions={
          isAdmin ? (
            <Link href="/dashboard/admin">
              <Button size="lg" className="gap-2">
                <Crown className="w-4 h-4" />
                Admin Dashboard
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Platform Admin Section */}
      {isAdmin && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-cyan-500/5 to-accent/10 dark:from-primary/10 dark:via-cyan-500/5 dark:to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Crown className="w-5 h-5 text-primary" />
              Platform Admin Access
            </CardTitle>
            <CardDescription className="text-base">
              Manage platform operations, review APIs, and monitor system health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Link href="/dashboard/admin/apis/review">
                <Button variant="default" size="lg">
                  Review APIs
                </Button>
              </Link>
              <Link href="/dashboard/admin/feature-flags">
                <Button variant="outline" size="lg">
                  Feature Flags
                </Button>
              </Link>
              <Link href="/dashboard/admin/users">
                <Button variant="outline" size="lg">
                  Manage Users
                </Button>
              </Link>
              <Link href="/dashboard/admin/tracker">
                <Button variant="outline" size="lg">
                  Implementation Tracker
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span className="text-primary [@supports(background-clip:text)]:bg-gradient-to-r [@supports(background-clip:text)]:from-primary [@supports(background-clip:text)]:to-cyan-500 [@supports(background-clip:text)]:bg-clip-text [@supports(background-clip:text)]:text-transparent">Quick Actions</span>
          <Zap className="w-5 h-5 text-primary" />
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isProvider && (
            <>
              <Link href="/dashboard/apis/new" className="group">
                <Card className="cursor-pointer hover:shadow-lg hover:border-cyan-500/40 transition-all duration-200 group-hover:-translate-y-0.5 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Box className="h-5 w-5" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-base mb-2">Publish API</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Upload OpenAPI spec and create new API
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/provider/analytics" className="group">
                <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group-hover:-translate-y-0.5 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-base mb-2">Provider Analytics</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      View revenue and subscriber metrics
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {isConsumer && (
            <>
              <Link href="/marketplace" className="group">
                <Card className="cursor-pointer hover:shadow-lg hover:border-cyan-500/40 transition-all duration-200 group-hover:-translate-y-0.5 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Box className="h-5 w-5" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-base mb-2">Browse APIs</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Discover and subscribe to APIs
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/sandbox" className="group">
                <Card className="cursor-pointer hover:shadow-lg hover:border-cyan-500/40 transition-all duration-200 group-hover:-translate-y-0.5 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Code2 className="h-5 w-5" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-base mb-2">API Sandbox</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Test APIs in isolated environment
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          <Link href="/dashboard/playground" className="group">
            <Card className="cursor-pointer hover:shadow-lg hover:border-cyan-500/40 transition-all duration-200 group-hover:-translate-y-0.5 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-2">AI Playground</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate code with AI
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/analytics" className="group">
            <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group-hover:-translate-y-0.5 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-2">Analytics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  View usage and performance data
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recommended for you (consumers) */}
      {isConsumer && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended for You</CardTitle>
            <CardDescription>APIs you might like based on your subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <RecommendedAPIs apis={recommendations} title="" />
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div>
        <h2 className="text-xl font-bold mb-3">Overview</h2>
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats userId={userData.id} orgId={org?.id} isProvider={isProvider} />
        </Suspense>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <Link href="/dashboard/activity">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity userId={userData.id} />
        </Suspense>
      </div>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

async function DashboardStats({
  userId,
  orgId,
  isProvider,
}: {
  userId: string;
  orgId: string;
  isProvider: boolean;
}) {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Get subscription count and IDs for org
  const { data: subscriptions, count: subscriptionCount } = await supabase
    .from('api_subscriptions')
    .select('id', { count: 'exact' })
    .eq('organization_id', orgId)
    .eq('status', 'active');
  const subscriptionIds = (subscriptions ?? []).map((s) => s.id);

  // API calls (30d) and success rate for consumers
  let apiCalls30d = 0;
  let successRate = 100;
  if (!isProvider && subscriptionIds.length > 0) {
    const { data: requests } = await supabase
      .from('api_requests_log')
      .select('status_code')
      .in('subscription_id', subscriptionIds)
      .gte('created_at', thirtyDaysAgo);
    if (requests?.length) {
      apiCalls30d = requests.length;
      const success = requests.filter((r) => r.status_code >= 200 && r.status_code < 300).length;
      successRate = Math.round((success / requests.length) * 100);
    }
  }

  // Monthly spend (invoices for org, last 30d)
  let monthlySpend = 0;
  try {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount, total')
      .eq('organization_id', orgId)
      .gte('created_at', thirtyDaysAgo)
      .eq('status', 'paid');
    monthlySpend = (invoices ?? []).reduce((sum, inv) => sum + Number((inv as any).total_amount ?? (inv as any).total ?? 0), 0);
  } catch {
    // table or columns may not exist
  }

  // Get published APIs count, provider revenue, and total subscribers (provider)
  let publishedAPIsCount = 0;
  let providerRevenue = 0;
  let totalSubscribers = 0;
  if (isProvider) {
    const { count } = await supabase
      .from('apis')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'published');
    publishedAPIsCount = count || 0;
    const { data: apiIds } = await supabase.from('apis').select('id').eq('organization_id', orgId);
    const ids = (apiIds ?? []).map((a) => a.id);
    if (ids.length > 0) {
      const { data: rev } = await supabase
        .from('invoices')
        .select('total_amount, total')
        .in('api_id', ids)
        .gte('created_at', thirtyDaysAgo)
        .eq('status', 'paid');
      providerRevenue = (rev ?? []).reduce((sum, r) => sum + Number((r as any).total_amount ?? (r as any).total ?? 0), 0);
      const { count: subCount } = await supabase
        .from('api_subscriptions')
        .select('*', { count: 'exact', head: true })
        .in('api_id', ids)
        .eq('status', 'active');
      totalSubscribers = subCount ?? 0;
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {isProvider && (
        <>
          <Card className="hover:shadow-lg hover:border-primary/20 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Published APIs
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Box className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-xl font-bold">{publishedAPIsCount}</div>
                </div>
              <p className="text-xs text-muted-foreground mt-2">
                Active in marketplace
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:border-primary/20 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Subscribers
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-xl font-bold">{totalSubscribers}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all APIs
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:border-primary/20 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue (30d)
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-xl font-bold">{formatCurrency(providerRevenue)}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="hover:shadow-lg hover:border-primary/20 transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {isProvider ? 'API Calls (30d)' : 'Active Subscriptions'}
          </CardTitle>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Activity className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold">
              {isProvider ? '—' : (subscriptionCount ?? 0)}
            </div>
            {!isProvider && apiCalls30d > 0 && (
              <div className="text-xs text-muted-foreground">
                {apiCalls30d.toLocaleString()} calls
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isProvider ? 'Via gateway' : 'Current subscriptions'}
          </p>
        </CardContent>
      </Card>

      {!isProvider && (
        <>
          <Card className="hover:shadow-lg hover:border-primary/20 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Spend
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(monthlySpend)}</div>
              <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg hover:border-primary/20 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <CheckCircle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground mt-2">API calls (30d)</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

async function RecentActivity({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: activities } = await supabase
    .from('audit_logs')
    .select('id, action, resource_type, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(8);

  if (!activities || activities.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-muted">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium mb-1">No recent activity</p>
              <p className="text-sm text-muted-foreground">
                Your activity will appear here as you use the platform
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/30">Success</Badge>;
      case 'failed':
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-warning/30">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatAction = (action: string) => {
    return action.split('.').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0 border-border/50"
            >
              <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                {getStatusIcon(activity.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-sm">
                    {formatAction(activity.action)}
                  </p>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.resource_type}
                  {(() => {
                    const meta = (activity as Record<string, unknown>).metadata;
                    if (meta && typeof meta === 'object' && meta !== null) {
                      return (
                        <span className="text-xs ml-2">
                          {Object.keys(meta).length} details
                        </span>
                      );
                    }
                    return null;
                  })()}
                </p>
              </div>
              <div className="text-xs text-muted-foreground flex-shrink-0">
                {new Date(activity.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-10 w-10 bg-muted animate-pulse rounded-lg" />
          </CardHeader>
          <CardContent>
            <div className="h-10 w-20 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 pb-4 border-b last:border-0"
            >
              <div className="h-10 w-10 bg-muted animate-pulse rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
