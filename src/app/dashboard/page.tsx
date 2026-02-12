import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Box,
  BarChart3,
  Code2,
  Crown,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
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

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Welcome back, {userData.full_name}
          {isAdmin && <Crown className="w-6 h-6 text-yellow-500" />}
        </h1>
        <p className="text-muted-foreground mt-2">
          {org?.name} • {org?.plan.charAt(0).toUpperCase() + org?.plan.slice(1)} Plan
        </p>
      </div>

      {/* Platform Admin Section */}
      {isAdmin && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Platform Admin Access
            </CardTitle>
            <CardDescription>
              Manage platform operations, review APIs, and monitor system health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Link href="/dashboard/admin">
                <Button variant="default">
                  <Activity className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/admin/apis/review">
                <Button variant="outline">
                  Review APIs
                </Button>
              </Link>
              <Link href="/dashboard/admin/feature-flags">
                <Button variant="outline">
                  Feature Flags
                </Button>
              </Link>
              <Link href="/dashboard/admin/tracker">
                <Button variant="outline">
                  Implementation Tracker
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isProvider && (
            <>
              <Link href="/dashboard/apis/new">
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Publish API
                    </CardTitle>
                    <Box className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Upload OpenAPI spec and create new API
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/provider/analytics">
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Provider Analytics
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      View revenue and subscriber metrics
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {isConsumer && (
            <>
              <Link href="/marketplace">
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Browse APIs
                    </CardTitle>
                    <Box className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Discover and subscribe to APIs
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/sandbox">
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      API Sandbox
                    </CardTitle>
                    <Code2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Test APIs in isolated environment
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          <Link href="/dashboard/playground">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  AI Playground
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Generate code with Claude AI
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/analytics">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Analytics
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  View usage and performance data
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats userId={userData.id} orgId={org?.id} isProvider={isProvider} />
        </Suspense>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity userId={userData.id} />
        </Suspense>
      </div>
    </div>
  );
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

  // Get subscription count
  const { count: subscriptionCount } = await supabase
    .from('api_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'active');

  // Get published APIs count (if provider)
  let publishedAPIsCount = 0;
  if (isProvider) {
    const { count } = await supabase
      .from('apis')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'published');
    publishedAPIsCount = count || 0;
  }

  // Get total API calls (mock data for now)
  const totalAPICalls = 0;

  // Get total revenue (mock data for now)
  const totalRevenue = 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {isProvider && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Published APIs
              </CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedAPIsCount}</div>
              <p className="text-xs text-muted-foreground">
                Active in marketplace
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subscribers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Across all APIs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue}</div>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {isProvider ? 'API Calls' : 'Active Subscriptions'}
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isProvider ? totalAPICalls : subscriptionCount || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {isProvider ? 'This month' : 'Current subscriptions'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

async function RecentActivity({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: activities } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No recent activity to display
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.resource_type} • {activity.status}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(activity.created_at).toLocaleDateString()}
              </p>
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
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
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
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-start justify-between border-b pb-4 last:border-0"
            >
              <div className="space-y-2">
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
