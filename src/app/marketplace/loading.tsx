import { Card } from '@/components/ui/card';

function SkeletonCard() {
  return (
    <Card className="overflow-hidden p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-muted animate-pulse shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-muted/80 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-muted/80 animate-pulse" />
        <div className="h-4 w-4/5 rounded bg-muted/60 animate-pulse" />
      </div>
      <div className="flex gap-4 pt-2">
        <div className="h-4 w-16 rounded bg-muted/60 animate-pulse" />
        <div className="h-4 w-20 rounded bg-muted/60 animate-pulse" />
      </div>
    </Card>
  );
}

export default function MarketplaceLoading() {
  return (
    <div className="space-y-6">
      {/* Top bar skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted/80 animate-pulse" />
        </div>
        <div className="flex-1 max-w-2xl">
          <div className="h-11 w-full rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-[140px] rounded-md bg-muted animate-pulse shrink-0" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
