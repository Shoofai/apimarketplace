import { createClient } from '@/lib/supabase/server';
import { BundleCard } from '@/components/marketplace/BundleCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package } from 'lucide-react';

export const metadata = {
  title: 'API Bundles | Marketplace',
  description: 'Curated packs of complementary APIs at a discount',
};

export default async function BundlesPage() {
  const supabase = await createClient();

  const { data: bundles } = await supabase
    .from('api_bundles')
    .select(`
      *,
      api_bundle_items (
        id, sort_order,
        api:apis(id, name, logo_url, slug)
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">API Bundles</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Curated packs of complementary APIs, sold together at a discount. Subscribe once to unlock them all.
        </p>
      </div>

      {bundles && bundles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bundles.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle as any} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 flex items-center justify-center mb-6">
            <Package className="h-10 w-10 text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bundles yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
            Curated API bundles are coming soon. Browse individual APIs in the marketplace while you wait.
          </p>
          <Button asChild>
            <Link href="/marketplace">Browse Marketplace</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
