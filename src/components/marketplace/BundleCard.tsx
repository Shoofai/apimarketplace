import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, Tag } from 'lucide-react';

interface BundleItem {
  api: {
    name: string;
    logo_url: string | null;
  } | null;
}

interface BundleCardProps {
  bundle: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    price_monthly: number;
    discount_percent: number;
    tags: string[] | null;
    api_bundle_items?: BundleItem[];
  };
}

export function BundleCard({ bundle }: BundleCardProps) {
  const items = bundle.api_bundle_items ?? [];
  const originalTotal = bundle.discount_percent > 0
    ? +(bundle.price_monthly / (1 - bundle.discount_percent / 100)).toFixed(2)
    : null;

  return (
    <Card className="group relative flex flex-col overflow-hidden border border-border/60 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200 rounded-xl">
      {/* Discount badge */}
      {bundle.discount_percent > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 gap-1">
            <Tag className="h-2.5 w-2.5" />
            {bundle.discount_percent}% off
          </Badge>
        </div>
      )}

      <div className="p-4 pb-0 flex items-start gap-3">
        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/40">
          {bundle.logo_url ? (
            <Image src={bundle.logo_url} alt={bundle.name} fill className="object-contain p-1" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate pr-8">{bundle.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {items.length} API{items.length !== 1 ? 's' : ''} included
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pt-2 flex-1">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {bundle.description || 'A curated bundle of APIs at a special price.'}
        </p>
      </div>

      {/* Included API logos */}
      {items.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 pt-3">
          {items.slice(0, 5).map((item, idx) => (
            <div
              key={idx}
              className="relative h-6 w-6 rounded-md overflow-hidden bg-muted border border-border/40 flex-shrink-0"
              title={item.api?.name ?? 'API'}
            >
              {item.api?.logo_url ? (
                <Image src={item.api.logo_url} alt={item.api.name} fill className="object-contain p-0.5" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-muted-foreground">
                  {item.api?.name?.charAt(0) ?? '?'}
                </div>
              )}
            </div>
          ))}
          {items.length > 5 && (
            <span className="text-xs text-muted-foreground">+{items.length - 5} more</span>
          )}
        </div>
      )}

      {/* Tags */}
      {bundle.tags && bundle.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 pt-2">
          {bundle.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[11px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 mt-2 border-t border-border/40 bg-muted/20">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-foreground">
              ${bundle.price_monthly.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">/mo</span>
          </div>
          {originalTotal && (
            <span className="text-xs text-muted-foreground line-through">
              ${originalTotal.toFixed(2)}/mo
            </span>
          )}
        </div>
        <Button asChild size="sm" variant="default" className="h-7 text-xs px-3">
          <Link href={`/marketplace/bundles/${bundle.slug}`}>View Bundle</Link>
        </Button>
      </div>
    </Card>
  );
}
