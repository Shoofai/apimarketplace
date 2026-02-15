import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Crown,
  DollarSign,
  TrendingUp,
  Globe,
  Users,
  Building2,
  Activity,
  CheckCircle,
  Heart,
  Shield,
  Gauge,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Check platform admin access
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
          <Crown className="h-8 w-8" />
          Admin Dashboard
        </h1>
          <p className="text-muted-foreground">Platform operations and analytics</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/health">
            <Button variant="outline" className="gap-2">
              <Heart className="h-4 w-4" />
              System Health
            </Button>
          </Link>
          <Link href="/dashboard/admin/security">
            <Button variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </Button>
          </Link>
          <Link href="/dashboard/admin/performance">
            <Button variant="outline" className="gap-2">
              <Gauge className="h-4 w-4" />
              Performance
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<KPIsSkeleton />}>
        <AdminKPIs />
      </Suspense>

      <Suspense fallback={<div className="h-64 w-full bg-muted animate-pulse rounded-lg" />}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}

async function AdminKPIs() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/stats`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return <div>Failed to load stats</div>;
  }

  const { kpis } = await response.json();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">GMV (30d)</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(kpis.gmv.last30d / 100).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Gross Marketplace Volume</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(kpis.platformRevenue.last30d / 100).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">3% of GMV (30d)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active APIs</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.activeApis}</div>
          <p className="text-xs text-muted-foreground">{kpis.activeSubscriptions} subscriptions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            {kpis.activeUsers.daily} active today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Organizations</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.totalOrgs}</div>
          <p className="text-xs text-muted-foreground">Total organizations</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">API Calls (24h)</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.apiCalls.last24h.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </CardContent>
      </Card>
    </div>
  );
}

async function RecentActivity() {
  const supabase = await createClient();

  // Get recent events (placeholder)
  const { data: recentApis } = await supabase
    .from('apis')
    .select('name, status, created_at, organizations(name)')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentApis?.map((api) => (
            <div key={api.name} className="flex items-center gap-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium">{api.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(Array.isArray(api.organizations) ? api.organizations[0] : api.organizations)?.name} • {api.status}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(api.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function KPIsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
