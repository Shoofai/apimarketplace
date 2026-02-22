import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GitCommit } from 'lucide-react';
import { GitNotesView } from '@/components/features/tracker/GitNotesView';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default async function GitNotesPage() {
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
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitCommit className="h-6 w-6" />
          Git notes
        </h1>
        <p className="text-muted-foreground">
          Changelog from refs/notes/implemented — most recent commits with notes first
        </p>
      </div>

      <Suspense fallback={<GitNotesSkeleton />}>
        <GitNotesView />
      </Suspense>
    </div>
  );
}

function GitNotesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-full max-w-md" />
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-full" />
        </Card>
      ))}
    </div>
  );
}
