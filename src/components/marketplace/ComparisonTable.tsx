import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';
import type { CompareAPI } from '@/lib/api/compare';

interface ComparisonTableProps {
  apis: CompareAPI[];
}

export function ComparisonTable({ apis }: ComparisonTableProps) {
  if (apis.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-medium text-muted-foreground w-40">Feature</th>
            {apis.map((api) => (
              <th key={api.id} className="p-4 text-left align-top w-[220px]">
                <Card className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="relative w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {api.logo_url ? (
                        <Image
                          src={api.logo_url}
                          alt={api.name}
                          fill
                          sizes="56px"
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-xl font-bold text-muted-foreground">{api.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{api.name}</div>
                      <div className="text-sm text-muted-foreground">by {api.organization?.name ?? 'Unknown'}</div>
                    </div>
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/marketplace/${api.organization?.slug ?? 'api'}/${api.slug}`}>
                        Subscribe
                      </Link>
                    </Button>
                  </div>
                </Card>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm">
          <tr className="border-b">
            <td className="p-4 font-medium text-muted-foreground">Pricing</td>
            {apis.map((api) => (
              <td key={api.id} className="p-4 align-top">
                <div className="space-y-1">
                  {api.pricing_plans?.length
                    ? api.pricing_plans.map((p) => (
                        <div key={p.name} className="flex justify-between gap-2">
                          <span>{p.name}</span>
                          <span>{p.price_monthly === 0 ? 'Free' : formatCurrency(p.price_monthly) + '/mo'}</span>
                        </div>
                      ))
                    : '—'}
                </div>
              </td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-4 font-medium text-muted-foreground">Included calls</td>
            {apis.map((api) => (
              <td key={api.id} className="p-4 align-top">
                {api.pricing_plans?.length
                  ? api.pricing_plans.map((p) => (
                      <div key={p.name}>
                        {p.included_calls != null ? p.included_calls.toLocaleString() : '—'}
                      </div>
                    ))
                  : '—'}
              </td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-4 font-medium text-muted-foreground">Rate limit / day</td>
            {apis.map((api) => (
              <td key={api.id} className="p-4 align-top">
                {api.pricing_plans?.length
                  ? api.pricing_plans.map((p) => (
                      <div key={p.name}>
                        {p.rate_limit_per_day != null ? p.rate_limit_per_day.toLocaleString() : '—'}
                      </div>
                    ))
                  : '—'}
              </td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-4 font-medium text-muted-foreground">Endpoints</td>
            {apis.map((api) => (
              <td key={api.id} className="p-4 align-top">
                {api.endpoints_count != null ? api.endpoints_count : '—'}
              </td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-4 font-medium text-muted-foreground">Features</td>
            {apis.map((api) => (
              <td key={api.id} className="p-4 align-top">
                {api.pricing_plans?.some((p) => p.features?.length) ? (
                  <ul className="list-disc list-inside space-y-0.5">
                    {api.pricing_plans?.flatMap((p) => p.features ?? []).slice(0, 5).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                ) : (
                  '—'
                )}
              </td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-4 font-medium text-muted-foreground">Rating</td>
            {apis.map((api) => (
              <td key={api.id} className="p-4 align-top">
                {api.avg_rating != null && api.avg_rating > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{api.avg_rating.toFixed(1)}</span>
                    {api.total_reviews != null && api.total_reviews > 0 && (
                      <span className="text-muted-foreground">({api.total_reviews})</span>
                    )}
                  </div>
                ) : (
                  '—'
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
