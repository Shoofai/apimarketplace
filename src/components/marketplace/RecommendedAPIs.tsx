import Link from 'next/link';
import { APICard } from '@/components/marketplace/APICard';
import type { RecommendedAPI } from '@/lib/recommendations/engine';

interface RecommendedAPIsProps {
  apis: RecommendedAPI[];
  title?: string;
}

export function RecommendedAPIs({ apis, title = 'Recommended for you' }: RecommendedAPIsProps) {
  if (!apis?.length) return null;

  return (
    <section>
      {title ? <h2 className="text-xl font-semibold mb-4">{title}</h2> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apis.map((api) => (
          <APICard key={api.id} api={api} />
        ))}
      </div>
    </section>
  );
}
