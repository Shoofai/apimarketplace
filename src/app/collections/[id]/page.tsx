import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { APICard } from '@/components/marketplace/APICard';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function PublicCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const supabase = await createClient();

  const { data: collection } = await supabase
    .from('api_collections')
    .select('id, name, description, is_public')
    .eq('id', id)
    .single();

  if (!collection || !(collection as { is_public: boolean }).is_public) notFound();

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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/collections"><ArrowLeft className="h-4 w-4 mr-1" /> Back to collections</Link>
        </Button>
        <div className="mt-6">
          <h1 className="text-3xl font-bold">{(collection as { name: string }).name}</h1>
          {(collection as { description?: string }).description && (
            <p className="text-muted-foreground mt-2">{(collection as { description: string }).description}</p>
          )}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>APIs</CardTitle>
          </CardHeader>
          <CardContent>
            {apis.length === 0 ? (
              <p className="text-muted-foreground text-sm">No APIs in this collection.</p>
            ) : (
              <div className="space-y-4">
                {(apis as { id: string }[]).map((api) => (
                  <APICard key={api.id} api={api as never} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
