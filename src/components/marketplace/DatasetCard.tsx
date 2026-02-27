import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Star, Users, FileDown, Database, RefreshCw } from 'lucide-react';

interface DatasetMeta {
  file_format?: string;
  file_size_bytes?: number;
  update_frequency?: string;
  delivery_method?: string;
  sample_url?: string;
  license?: string;
}

interface DatasetCardProps {
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
    dataset_metadata?: DatasetMeta | null;
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
  };
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export function DatasetCard({ api }: DatasetCardProps) {
  const meta = (api.dataset_metadata ?? {}) as DatasetMeta;
  const rating = api.avg_rating || 0;
  const reviewCount = api.total_reviews || 0;
  const subscriberCount = api.total_subscribers || 0;
  const org = api.organization;

  return (
    <Card className="group relative flex flex-col overflow-hidden border border-border/60 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200 rounded-xl">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-0">
        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/40">
          {api.logo_url ? (
            <Image src={api.logo_url} alt={api.name} fill className="object-contain p-1" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Database className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm text-foreground truncate">{api.name}</h3>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30 shrink-0">
              Dataset
            </Badge>
          </div>
          {org && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{org.name}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pt-2 flex-1">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {api.short_description || api.description || 'No description available.'}
        </p>
      </div>

      {/* Dataset metadata badges */}
      <div className="flex flex-wrap gap-1.5 px-4 pt-3">
        {meta.file_format && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
            {meta.file_format.toUpperCase()}
          </span>
        )}
        {meta.file_size_bytes && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
            {formatBytes(meta.file_size_bytes)}
          </span>
        )}
        {meta.update_frequency && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
            <RefreshCw className="h-2.5 w-2.5" />
            {meta.update_frequency}
          </span>
        )}
        {meta.license && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
            {meta.license}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 mt-2 border-t border-border/40 bg-muted/20">
        <div className="flex items-center gap-3">
          {rating > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
              <span>({reviewCount})</span>
            </span>
          )}
          {subscriberCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {subscriberCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {meta.sample_url && (
            <a
              href={meta.sample_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" />
              Sample
            </a>
          )}
          {org && (
            <Button asChild size="sm" variant="default" className="h-7 text-xs px-3">
              <Link href={`/marketplace/${org.slug}/${api.slug}`}>View</Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
