import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TrackerOverview } from '@/components/features/tracker/TrackerOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default async function TrackerPage() {
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
    .eq('auth_id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Implementation Tracker</h1>
        <p className="text-muted-foreground">
          Track progress across all 28 sprints of APIMarketplace Pro
        </p>
      </div>

      <Suspense fallback={<TrackerSkeleton />}>
        <TrackerOverview />
      </Suspense>
    </div>
  );
}

function TrackerSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
