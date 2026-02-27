import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Package, Tag, CheckCircle2, ArrowRight } from 'lucide-react';
import { BundleSubscribeButton } from '@/components/marketplace/BundleSubscribeButton';

interface BundleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BundleDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('api_bundles')
    .select('name, description')
    .eq('slug', slug)
    .single();
  return {
    title: data ? `${data.name} Bundle | Marketplace` : 'Bundle Not Found',
    description: data?.description ?? 'API bundle details',
  };
}

export default async function BundleDetailPage({ params }: BundleDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: bundle } = await supabase
    .from('api_bundles')
    .select(`
      *,
      api_bundle_items (
        id, sort_order,
        api:apis(
          id, name, slug, logo_url, short_description,
          pricing_plans:api_pricing_plans(price_monthly),
          organization:organizations!apis_organization_id_fkey(name, slug)
        )
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!bundle) notFound();

  const items = (bundle.api_bundle_items ?? []) as any[];

  // Compute individual total
  let individualTotal = 0;
  for (const item of items) {
    const plans = item.api?.pricing_plans ?? [];
    const prices = plans.map((p: any) => p.price_monthly ?? 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    individualTotal += minPrice;
  }
  const savings = Math.max(0, individualTotal - Number(bundle.price_monthly));

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <div className="bg-card border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start gap-6">
            <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted border border-border flex-shrink-0">
              {bundle.logo_url ? (
                <Image src={bundle.logo_url} alt={bundle.name} fill className="object-contain p-2" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold">{bundle.name}</h1>
                {bundle.discount_percent > 0 && (
                  <Badge className="bg-orange-500 text-white gap-1">
                    <Tag className="h-3 w-3" />
                    {bundle.discount_percent}% off
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">
                {bundle.description || 'A curated bundle of APIs.'}
              </p>
              {bundle.tags && bundle.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {bundle.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Included APIs */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Included APIs ({items.length})</h2>
          {items.map((item: any) => {
            const api = item.api;
            if (!api) return null;
            const plans = api.pricing_plans ?? [];
            const prices = plans.map((p: any) => p.price_monthly ?? 0);
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            return (
              <Card key={item.id} className="flex items-start gap-4 p-4">
                <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                  {api.logo_url ? (
                    <Image src={api.logo_url} alt={api.name} fill className="object-contain p-1" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                      {api.name?.charAt(0) ?? '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{api.name}</p>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  </div>
                  {api.organization?.name && (
                    <p className="text-xs text-muted-foreground">{api.organization.name}</p>
                  )}
                  {api.short_description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{api.short_description}</p>
                  )}
                </div>
                <div className="text-right">
                  {minPrice > 0 ? (
                    <p className="text-sm font-medium">${minPrice.toFixed(2)}<span className="text-xs text-muted-foreground">/mo</span></p>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Free</Badge>
                  )}
                  {api.organization?.slug && api.slug && (
                    <Link
                      href={`/marketplace/${api.organization.slug}/${api.slug}`}
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 justify-end"
                    >
                      View <ArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Purchase card */}
        <div>
          <Card className="p-6 sticky top-6 space-y-4">
            <div>
              <p className="text-3xl font-bold">
                ${Number(bundle.price_monthly).toFixed(2)}
                <span className="text-base font-normal text-muted-foreground">/mo</span>
              </p>
              {savings > 0 && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  Save ${savings.toFixed(2)}/mo vs. subscribing individually
                </p>
              )}
              {individualTotal > 0 && (
                <p className="text-sm text-muted-foreground">
                  Individual cost: <span className="line-through">${individualTotal.toFixed(2)}/mo</span>
                </p>
              )}
            </div>
            <BundleSubscribeButton bundleId={bundle.id} bundleName={bundle.name} />
            <ul className="space-y-1.5">
              {items.slice(0, 6).map((item: any) => (
                <li key={item.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  {item.api?.name ?? 'API'}
                </li>
              ))}
              {items.length > 6 && (
                <li className="text-xs text-muted-foreground pl-5">+{items.length - 6} more APIs</li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
