import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';
import { CreateCollectionForm } from './CreateCollectionForm';

export default async function CollectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: collections } = await supabase
    .from('api_collections')
    .select('id, name, description, slug, is_public, created_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderOpen className="h-8 w-8" />
            My Collections
          </h1>
          <p className="text-muted-foreground">
            Curated lists of APIs you can share or keep private
          </p>
        </div>
        <CreateCollectionForm />
      </div>

      {(!collections || collections.length === 0) ? (
        <Card>
          <CardHeader>
            <CardTitle>No collections yet</CardTitle>
            <CardDescription>
              Create a collection to group APIs and optionally make it public.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCollectionForm triggerLabel="Create your first collection" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(collections as { id: string; name: string; description?: string | null; is_public: boolean }[]).map((c) => (
            <Link key={c.id} href={`/dashboard/collections/${c.id}`}>
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                  {c.description && (
                    <CardDescription className="line-clamp-2">{c.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <span className="text-xs text-muted-foreground">
                    {c.is_public ? 'Public' : 'Private'}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Public directory</CardTitle>
          <CardDescription>Browse collections shared by the community.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/collections">Browse public collections</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
