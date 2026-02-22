import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Zap } from 'lucide-react';
import { AIPlayground } from '@/components/features/playground/AIPlayground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default async function PlaygroundPage({
  searchParams,
}: {
  searchParams: Promise<{ api?: string }>;
}) {
  const resolved = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Optionally load API details if api param is provided
  let apiData = null;
  if (resolved.api) {
    const { data } = await supabase
      .from('apis')
      .select('id, name, slug, openapi_spec')
      .eq('id', resolved.api)
      .single();
    apiData = data;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6" />
          AI Code Playground
        </h1>
        <p className="text-muted-foreground">
          Generate code, get explanations, and debug with AI assistance
        </p>
      </div>

      <Suspense fallback={<PlaygroundSkeleton />}>
        <AIPlayground
          apiId={apiData?.id}
          apiSpec={apiData?.openapi_spec}
          language="javascript"
        />
      </Suspense>
    </div>
  );
}

function PlaygroundSkeleton() {
  return (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-full w-full" />
      </CardContent>
    </Card>
  );
}
