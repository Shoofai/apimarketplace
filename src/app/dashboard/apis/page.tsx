import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Box,
  Plus,
  Search,
  BarChart3,
  Users,
  TrendingUp,
  FileText,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default async function MyAPIsPage() {
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
        slug
      )
    `)
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect('/login');
  }

  const org = userData.organizations as any;

  // Check if user is a provider
  const isProvider = org?.type === 'provider' || org?.type === 'both';

  if (!isProvider) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="My APIs"
        description="Manage and monitor your published APIs"
        icon="box"
        actions={
          <Link href="/dashboard/apis/publish">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Publish New API
            </Button>
          </Link>
        }
      />

      {/* Search and Filters */}
      <form action="/dashboard/apis" method="get" className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            name="q"
            placeholder="Search your APIs..."
            defaultValue={resolved.q ?? ''}
            className="pl-10"
            aria-label="Search APIs by name or description"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {/* APIs List */}
      <Suspense fallback={<APIsListSkeleton />}>
        <APIsList orgId={org.id} orgSlug={org.slug ?? 'api'} query={resolved.q} />
      </Suspense>
    </div>
  );
}

function escapeIlike(q: string): string {
  return q.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

async function APIsList({ orgId, orgSlug, query }: { orgId: string; orgSlug: string; query?: string }) {
  const supabase = await createClient();

  let queryBuilder = supabase
    .from('apis')
    .select(`
      id,
      name,
      slug,
      description,
      version,
      status,
      created_at,
      categories
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(DEFAULT_LIST_LIMIT);

  if (query?.trim()) {
    const pattern = `%${escapeIlike(query.trim())}%`;
    queryBuilder = queryBuilder.or(`name.ilike.${pattern},description.ilike.${pattern}`);
  }

  const { data: apis } = await queryBuilder;

  if (!apis || apis.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <Box className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No APIs yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Get started by publishing your first API to the marketplace
          </p>
          <Link href="/dashboard/apis/publish">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Publish Your First API
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Get subscriber counts for each API
  const apiIds = apis.map(api => api.id);
  const { data: subscriptionCounts } = await supabase
    .from('api_subscriptions')
    .select('api_id')
    .in('api_id', apiIds)
    .eq('status', 'active')
    .limit(DEFAULT_LIST_LIMIT);

  const subscriberMap = (subscriptionCounts || []).reduce((acc: Record<string, number>, sub) => {
    acc[sub.api_id] = (acc[sub.api_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {apis.map((api) => (
        <APICard
          key={api.id}
          api={api}
          orgSlug={orgSlug}
          subscriberCount={subscriberMap[api.id] || 0}
        />
      ))}
    </div>
  );
}

function APICard({ api, orgSlug, subscriberCount }: { api: any; orgSlug: string; subscriberCount: number }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'review':
        return 'outline';
      case 'deprecated':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Box className="h-5 w-5" />
              </div>
              <Badge variant={getStatusColor(api.status)}>
                {getStatusLabel(api.status)}
              </Badge>
            </div>
            <CardTitle className="text-base mb-1">{api.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {api.description || 'No description provided'}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/apis/${api.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/docs/${orgSlug}/${api.slug}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Documentation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Deprecate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Users className="h-3 w-3" />
              Subscribers
            </div>
            <div className="text-xl font-bold">{subscriberCount}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <BarChart3 className="h-3 w-3" />
              Calls
            </div>
            <div className="text-xl font-bold">0</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <DollarSign className="h-3 w-3" />
              Revenue
            </div>
            <div className="text-xl font-bold">$0</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>v{api.version || '1.0.0'}</span>
          <span>{new Date(api.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function APIsListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[1, 2, 3].map((j) => (
                <div key={j}>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-7 w-12" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
