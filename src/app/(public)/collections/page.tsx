import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import { Button } from '@/components/ui/button';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Collections | ${name}`,
    description: 'Curated API lists shared by the community. Discover public collections of APIs.',
  };
}

export default async function PublicCollectionsPage() {
  const supabase = await createClient();
  const { data: collections } = await supabase
    .from('api_collections')
    .select('id, name, description, slug, created_at')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Public collections"
        subtitle="Curated API lists shared by the community. Save and share your favorite APIs."
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {(!collections || collections.length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No public collections yet.</p>
              <p className="text-sm text-muted-foreground mb-6">Sign in to create and share your own collection.</p>
              <Button asChild><Link href="/login">Sign in</Link></Button>
            </CardContent>
          </Card>
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
