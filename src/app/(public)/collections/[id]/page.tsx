import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, FolderOpen, Star, Users } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const platformName = await getPlatformName();

  const { data: collection } = await supabase
    .from('api_collections')
    .select('name, description')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle();

  if (!collection) {
    return { title: `Collection | ${platformName}` };
  }

  return {
    title: `${collection.name} | Collections | ${platformName}`,
    description: collection.description ?? `A curated API collection on ${platformName}.`,
  };
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: collection } = await supabase
    .from('api_collections')
    .select(`
      id,
      name,
      description,
      created_at,
      is_public,
      owner:users!api_collections_user_id_fkey(full_name),
      collection_items:api_collection_items(
        api:apis(
          id, name, slug, short_description, avg_rating, total_subscribers,
          organization:organizations!apis_organization_id_fkey(name, slug)
        )
      )
    `)
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle();

  if (!collection) notFound();

  const items = (collection.collection_items ?? []) as unknown as Array<{
    api: {
      id: string;
      name: string;
      slug: string;
      short_description?: string | null;
      avg_rating?: number | null;
      total_subscribers?: number | null;
      organization?: { name: string; slug: string } | null;
    } | null;
  }>;

  const apis = items.map((item) => item.api).filter(Boolean) as NonNullable<typeof items[0]['api']>[];
  const owner = (collection.owner as unknown as { full_name: string } | null);

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title={collection.name}
        subtitle={collection.description ?? `A curated collection of ${apis.length} APIs.`}
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav className="mb-6 flex items-center gap-3">
          <Link href="/collections">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              All Collections
            </Button>
          </Link>
          {owner?.full_name && (
            <span className="text-sm text-muted-foreground">by {owner.full_name}</span>
          )}
          <span className="text-sm text-muted-foreground ml-auto">
            {apis.length} API{apis.length !== 1 ? 's' : ''}
          </span>
        </nav>

        {apis.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FolderOpen className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p>This collection is empty.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {apis.map((api) => (
              <Link
                key={api.id}
                href={`/marketplace/${api.organization?.slug ?? 'org'}/${api.slug}`}
              >
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{api.name}</h3>
                        {api.short_description && (
                          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                            {api.short_description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {api.organization && (
                            <Badge variant="secondary" className="text-xs font-normal">
                              {api.organization.name}
                            </Badge>
                          )}
                          {typeof api.avg_rating === 'number' && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {api.avg_rating.toFixed(1)}
                            </span>
                          )}
                          {api.total_subscribers != null && api.total_subscribers > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {api.total_subscribers.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0">
                        View API
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/marketplace">
            <Button variant="outline">Browse full marketplace</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
