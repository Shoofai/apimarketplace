import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

export default async function PublicCollectionsPage() {
  const supabase = await createClient();
  const { data: collections } = await supabase
    .from('api_collections')
    .select('id, name, description, slug, created_at')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Public collections</h1>
        <p className="text-muted-foreground mb-8">Curated API lists shared by the community</p>
        {(!collections || collections.length === 0) ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No public collections yet.</CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(collections as { id: string; name: string; description?: string | null }[]).map((c) => (
              <Link key={c.id} href={`/collections/${c.id}`}>
                <Card className="hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-6">
                    <FolderOpen className="h-5 w-5 text-muted-foreground mb-2" />
                    <h3 className="font-semibold">{c.name}</h3>
                    {c.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{c.description}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
