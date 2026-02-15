import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { APICard } from '@/components/marketplace/APICard';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { CollectionActions } from './CollectionActions';
import { RemoveFromCollectionButton } from './RemoveFromCollectionButton';

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: collection } = await supabase
    .from('api_collections')
    .select('id, name, description, is_public')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!collection) notFound();

  const { data: items } = await supabase
    .from('api_collection_items')
    .select('api_id')
    .eq('collection_id', id)
    .order('sort_order');

  const apiIds = (items ?? []).map((r) => (r as { api_id: string }).api_id);
  let apis: unknown[] = [];
  if (apiIds.length > 0) {
    const { data } = await supabase
      .from('apis')
      .select(`
        id, name, slug, short_description, logo_url, avg_rating, total_reviews, total_subscribers,
        organization:organizations!apis_organization_id_fkey(name, slug, logo_url),
        category:api_categories(name, slug),
        pricing_plans:api_pricing_plans(price_monthly)
      `)
      .in('id', apiIds)
      .eq('status', 'published');
    apis = (data ?? []).map((api: { pricing_plans?: { price_monthly?: number }[] }) => {
      const prices = api.pricing_plans?.map((p) => p.price_monthly ?? 0) ?? [];
      return {
        ...api,
        minPrice: prices.length ? Math.min(...prices) : undefined,
        maxPrice: prices.length ? Math.max(...prices) : undefined,
      };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/collections"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderOpen className="h-8 w-8" />
            {(collection as { name: string }).name}
          </h1>
          {(collection as { description?: string }).description && (
            <p className="text-muted-foreground mt-1">{(collection as { description: string }).description}</p>
          )}
        </div>
        <CollectionActions collectionId={id} name={(collection as { name: string }).name} isPublic={(collection as { is_public: boolean }).is_public} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>APIs in this collection</CardTitle>
        </CardHeader>
        <CardContent>
          {apis.length === 0 ? (
              <p className="text-muted-foreground text-sm">No APIs yet. Add some from the marketplace.</p>
            ) : (
              <div className="space-y-4 mt-4">
                {(apis as { id: string }[]).map((api) => (
                  <div key={api.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <APICard api={api as never} />
                    </div>
                    <RemoveFromCollectionButton collectionId={id} apiId={api.id} key={`rm-${api.id}`} />
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/marketplace">Add APIs from marketplace</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

