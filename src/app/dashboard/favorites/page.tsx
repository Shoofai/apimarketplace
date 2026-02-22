import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APICard } from '@/components/marketplace/APICard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: rows } = await supabase
    .from('api_favorites')
    .select('api_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(DEFAULT_LIST_LIMIT);

  const apiIds = (rows ?? []).map((r) => r.api_id);
  let apis: any[] = [];

  if (apiIds.length > 0) {
    const { data } = await supabase
      .from('apis')
      .select(
        `
        id, name, slug, short_description, logo_url, avg_rating, total_reviews, total_subscribers,
        organization:organizations!apis_organization_id_fkey(name, slug, logo_url),
        category:api_categories(name, slug),
        pricing_plans:api_pricing_plans(price_monthly)
      `
      )
      .in('id', apiIds)
      .limit(DEFAULT_LIST_LIMIT);
    apis = (data ?? []).map((api: any) => {
      const prices = api.pricing_plans?.map((p: { price_monthly?: number }) => p.price_monthly ?? 0) ?? [];
      return {
        ...api,
        minPrice: prices.length ? Math.min(...prices) : undefined,
        maxPrice: prices.length ? Math.max(...prices) : undefined,
      };
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6" />
          My Favorites
        </h1>
        <p className="text-muted-foreground">
          APIs you&apos;ve saved for later
        </p>
      </div>

      {apis.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No favorites yet</CardTitle>
            <CardDescription>
              Browse the marketplace and click the heart on any API to add it here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apis.map((api) => (
            <APICard key={api.id} api={api} />
          ))}
        </div>
      )}
    </div>
  );
}
