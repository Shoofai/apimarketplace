import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Star, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';
import { CompareButton } from '@/components/marketplace/CompareButton';
import { FavoriteButton } from '@/components/marketplace/FavoriteButton';

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

export function APICard({ api }: APICardProps) {
  const rating = api.avg_rating || 0;
  const reviewCount = api.total_reviews || 0;
  const subscriberCount = api.total_subscribers || 0;
  const isUnclaimed = api.status === 'unclaimed';
  const isClaimPending = api.status === 'claim_pending';

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* API Logo */}
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          {api.logo_url ? (
            <img
              src={api.logo_url}
              alt={api.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-2xl font-bold text-gray-400">
              {api.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* API Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {api.name}
              </h3>
              <p className="text-sm text-gray-500">by {api.organization?.name ?? 'Unknown'}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <FavoriteButton apiId={api.id} apiName={api.name} />
              <CompareButton apiId={api.id} apiName={api.name} />
              {isUnclaimed && <Badge variant="default">Claim this API</Badge>}
              {isClaimPending && <Badge variant="secondary">Claim Pending</Badge>}
              {!isUnclaimed && !isClaimPending && api.category?.name && (
                <Badge variant="secondary">{api.category.name}</Badge>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {api.short_description ?? api.description ?? 'No description available'}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900">{rating.toFixed(1)}</span>
                {reviewCount > 0 && (
                  <span className="text-gray-500">({reviewCount})</span>
                )}
              </div>
            )}

            {/* Subscribers */}
            {subscriberCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{subscriberCount.toLocaleString()} subscribers</span>
              </div>
            )}
          </div>

          {/* Pricing and CTA */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {isUnclaimed || isClaimPending ? (
                <span className="text-gray-500">Available to claim</span>
              ) : api.minPrice !== undefined ? (
                <span className="font-semibold text-gray-900">
                  {api.minPrice === 0 ? (
                    'Free tier available'
                  ) : (
                    <>
                      From {formatCurrency(api.minPrice)}
                      <span className="text-gray-500">/mo</span>
                    </>
                  )}
                </span>
              ) : (
                <span className="text-gray-500">Pricing available</span>
              )}
            </div>

            <Button asChild size="sm" variant={isUnclaimed ? 'default' : undefined}>
              <Link href={`/marketplace/${api.organization?.slug ?? 'api'}/${api.slug}`}>
                {isUnclaimed ? 'Claim this API' : isClaimPending ? 'Claim Pending' : 'View API'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
