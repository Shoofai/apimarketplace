import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Box,
  ExternalLink,
  Code2,
  FileText,
  Layers,
  Settings,
  TrendingUp,
  Zap,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default async function SubscriptionsPage() {
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
      current_organization_id,
      organizations:current_organization_id (
        id,
        name,
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6" />
            My Subscriptions
          </h1>
          <p className="text-muted-foreground">
            Manage your API subscriptions and usage
          </p>
        </div>
        <Link href="/marketplace">
          <Button size="lg" className="gap-2">
            <Box className="h-5 w-5" />
            Browse APIs
          </Button>
        </Link>
      </div>

      {/* Plan Info */}
      {org.plan === 'free' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You&apos;re on the Free plan. Upgrade to Pro or Enterprise for higher limits and advanced features.{' '}
            <Link href="/pricing" className="underline font-medium">
              View Plans
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Subscriptions List */}
      <Suspense fallback={<SubscriptionsListSkeleton />}>
        <SubscriptionsList orgId={org.id} />
      </Suspense>
    </div>
  );
}

async function SubscriptionsList({ orgId }: { orgId: string }) {
  const supabase = await createClient();

  // Get active subscriptions with pricing plan (for rate limits and quota)
  const { data: subscriptions } = await supabase
    .from('api_subscriptions')
    .select(`
      id,
      plan,
      status,
      created_at,
      updated_at,
      calls_this_month,
      pricing_plan:pricing_plan_id (
        id,
        name,
        included_calls,
        rate_limit_per_second,
        rate_limit_per_day,
        rate_limit_per_month
      ),
      api:api_id (
        id,
        name,
        slug,
        description,
        version,
        organization:organization_id (
          id,
          name,
          slug
        )
      )
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(DEFAULT_LIST_LIMIT);

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <Box className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No active subscriptions</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Browse the marketplace to discover and subscribe to APIs
          </p>
          <Link href="/marketplace">
            <Button size="lg" className="gap-2">
              <Box className="h-5 w-5" />
              Explore Marketplace
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Get usage data for each subscription
  const subscriptionIds = subscriptions.map(sub => sub.id);
  const { data: usageData } = await supabase
    .from('usage_records_daily')
    .select('subscription_id, total_calls')
    .in('subscription_id', subscriptionIds)
    .limit(DEFAULT_LIST_LIMIT);

  const usageMap = (usageData || []).reduce((acc: Record<string, number>, record) => {
    acc[record.subscription_id] = (acc[record.subscription_id] || 0) + record.total_calls;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {subscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription.id}
          subscription={subscription}
          totalCalls={usageMap[subscription.id] ?? (subscription as any).calls_this_month ?? 0}
        />
      ))}
    </div>
  );
}

function SubscriptionCard({ subscription, totalCalls }: { subscription: any; totalCalls: number }) {
  const api = subscription.api;
  const org = api?.organization;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trial':
        return 'secondary';
      case 'cancelled':
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const pricingPlan = subscription.pricing_plan as {
    name?: string;
    included_calls?: number | null;
    rate_limit_per_second?: number | null;
    rate_limit_per_day?: number | null;
    rate_limit_per_month?: number | null;
  } | null;
  const includedCalls = pricingPlan?.included_calls ?? 1000;
  const limits = {
    calls: includedCalls,
    name: pricingPlan?.name ?? subscription.plan ?? 'Free',
  };
  const usagePercent =
    limits.calls > 0 ? Math.min((totalCalls / limits.calls) * 100, 100) : 0;
  const rateLimitDesc = [
    pricingPlan?.rate_limit_per_second && `${pricingPlan.rate_limit_per_second}/sec`,
    pricingPlan?.rate_limit_per_day && `${pricingPlan.rate_limit_per_day}/day`,
    pricingPlan?.rate_limit_per_month && `${pricingPlan.rate_limit_per_month}/month`,
  ]
    .filter(Boolean)
    .join(' • ') || 'Standard limits';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Box className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">{api?.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  by {org?.name}
                  <span className="text-muted-foreground/50">•</span>
                  <Badge variant={getStatusColor(subscription.status)} className="text-xs">
                    {subscription.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {limits.name} Plan
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {api?.description || 'No description provided'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Stats & Rate Limits */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">API Calls This Month</span>
            <span className="font-medium">
              {totalCalls.toLocaleString()} / {limits.calls === 0 ? '∞' : limits.calls.toLocaleString()}
            </span>
          </div>
          {limits.calls > 0 && (
            <>
              <Progress value={usagePercent} className="h-2" />
              {usagePercent > 80 && (
                <div className="flex items-center gap-2 text-xs text-warning">
                  <AlertCircle className="h-3 w-3" />
                  <span>Approaching limit - consider upgrading your plan</span>
                </div>
              )}
            </>
          )}
          <div className="text-xs text-muted-foreground">
            Rate limit: {rateLimitDesc}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Link href={`/docs/${org?.slug}/${api?.slug}`}>
            <Button variant="outline" size="sm" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Docs
            </Button>
          </Link>
          <Link href={`/dashboard/developer/sandbox?api=${api?.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              <Code2 className="h-4 w-4 mr-2" />
              Test
            </Button>
          </Link>
          <Link href={`/dashboard/analytics/usage?subscription=${subscription.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </Button>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
          <div className="flex items-center gap-4">
            <span>v{api?.version || '1.0.0'}</span>
            <span>
              Subscribed {new Date(subscription.created_at).toLocaleDateString()}
            </span>
          </div>
          {subscription.status === 'active' && (
            <div className="flex items-center gap-1 text-success">
              <CheckCircle className="h-3 w-3" />
              <span>Active</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionsListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-9 w-full" />
              ))}
            </div>
            <div className="flex justify-between pt-3 border-t">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
