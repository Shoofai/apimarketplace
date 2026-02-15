import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Star, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';
import { CompareButton } from '@/components/marketplace/CompareButton';
import { FavoriteButton } from '@/components/marketplace/FavoriteButton';
import { cn } from '@/lib/utils';

interface APICardProps {
  api: {
    id: string;
    name: string;
    slug: string;
    short_description?: string | null;
    description?: string | null;
    logo_url: string | null;
    avg_rating: number | null;
    total_reviews: number | null;
    total_subscribers: number | null;
    total_api_calls?: number | null;
    status?: string | null;
    organization: {
      name: string;
      slug: string;
      logo_url: string | null;
    } | null;
    category: {
      name: string;
      slug: string;
    } | null;
    minPrice?: number;
    maxPrice?: number;
  };
}

/** Badge color class for category slug (enterprise semantic colors). */
function categoryBadgeClass(slug: string | undefined): string {
  if (!slug) return 'bg-muted text-muted-foreground';
  const s = slug.toLowerCase();
  if (s.includes('finance') || s.includes('payment')) return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
  if (s.includes('weather') || s.includes('geo') || s.includes('map')) return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30';
  if (s.includes('ai') || s.includes('ml') || s.includes('machine')) return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
  if (s.includes('communication') || s.includes('messaging')) return 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30';
  if (s.includes('commerce') || s.includes('ecommerce')) return 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30';
  if (s.includes('social')) return 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30';
  if (s.includes('development') || s.includes('tools')) return 'bg-muted text-muted-foreground border-border';
  return 'bg-muted text-muted-foreground border-border';
}

export function APICard({ api }: APICardProps) {
  const rating = api.avg_rating || 0;
  const reviewCount = api.total_reviews || 0;
  const subscriberCount = api.total_subscribers || 0;
  const totalCalls = api.total_api_calls ?? 0;
  const isUnclaimed = api.status === 'unclaimed';
  const isClaimPending = api.status === 'claim_pending';

  return (
    <Card
      className={cn(
        'flex flex-col p-4 min-h-[280px] border border-border bg-card',
        'transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5'
      )}
    >
      {/* Logo top, centered */}
      <div className="flex justify-center mb-3">
        <div className="w-16 h-16 rounded-lg border border-border bg-muted/30 dark:bg-muted/10 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
          {api.logo_url ? (
            <img
              src={api.logo_url}
              alt={api.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold bg-gradient-to-br from-primary/20 to-accent/20 text-primary dark:text-primary-foreground">
              {api.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Title + Org */}
      <div className="text-center mb-2 min-h-[2.5rem]">
        <h3 className="font-semibold text-foreground truncate px-1" title={api.name}>
          {api.name}
        </h3>
        <p className="text-xs text-muted-foreground truncate px-1">
          {api.organization?.name ?? 'Unknown'}
        </p>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap justify-center gap-1 mb-2">
        {isUnclaimed && (
          <Badge variant="default" className="text-xs">Claim</Badge>
        )}
        {isClaimPending && (
          <Badge variant="secondary" className="text-xs">Pending</Badge>
        )}
        {!isUnclaimed && !isClaimPending && api.category?.name && (
          <Badge variant="outline" className={cn('text-xs border', categoryBadgeClass(api.category?.slug))}>
            {api.category.name}
          </Badge>
        )}
        {!isUnclaimed && !isClaimPending && !api.category?.name && (
          <Badge variant="secondary" className="text-xs">API</Badge>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mb-2">
        {rating > 0 && (
          <div className="flex items-center gap-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
            {reviewCount > 0 && <span>({reviewCount})</span>}
          </div>
        )}
        {subscriberCount > 0 && (
          <div className="flex items-center gap-0.5">
            <Users className="w-3.5 h-3.5" />
            <span>{subscriberCount.toLocaleString()}</span>
          </div>
        )}
        {totalCalls > 0 && (
          <span>{totalCalls.toLocaleString()} calls</span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1 min-h-[2.5rem]">
        {api.short_description ?? api.description ?? 'No description available'}
      </p>

      {/* Price badge */}
      <div className="mb-3">
        {isUnclaimed || isClaimPending ? (
          <span className="inline-block text-xs text-muted-foreground">Claim to publish</span>
        ) : api.minPrice !== undefined ? (
          api.minPrice === 0 ? (
            <Badge variant="outline" className="text-xs bg-success/10 text-success-700 dark:text-success-300 border-success/30">
              Free
            </Badge>
          ) : api.maxPrice != null && api.maxPrice > 0 && api.maxPrice < 100000 ? (
            <span className="text-xs font-medium text-foreground">
              From {formatCurrency(api.minPrice)}/mo
            </span>
          ) : (
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              Enterprise
            </Badge>
          )
        ) : (
          <span className="text-xs text-muted-foreground">Pricing available</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant={isUnclaimed ? 'default' : 'outline'} className="flex-1">
          <Link href={`/marketplace/${api.organization?.slug ?? 'api'}/${api.slug}`}>
            {isUnclaimed ? 'Claim this API' : isClaimPending ? 'Claim Pending' : 'View API'}
          </Link>
        </Button>
        <FavoriteButton apiId={api.id} apiName={api.name} />
        <CompareButton apiId={api.id} apiName={api.name} />
      </div>
    </Card>
  );
}
