import Link from 'next/link';
import { getAPIsForCompare } from '@/lib/api/compare';
import { ComparisonTable } from '@/components/marketplace/ComparisonTable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getPlatformName } from '@/lib/settings/platform-name';

interface ComparePageProps {
  searchParams: { apis?: string };
}

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Compare APIs | ${name}`,
    description: 'Side-by-side comparison of APIs',
  };
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const apisParam = searchParams.apis ?? '';
  const ids = apisParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const apis = await getAPIsForCompare(ids);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compare APIs</h1>
          <p className="text-muted-foreground">
            Side-by-side comparison of up to 4 APIs
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>

      {apis.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {ids.length === 0
              ? 'Select APIs from the marketplace to compare (use the Compare checkbox on each card, then click the Compare bar).'
              : 'No valid APIs to compare. Select up to 4 published APIs from the marketplace.'}
          </p>
          <Button asChild>
            <Link href="/marketplace">Browse Marketplace</Link>
          </Button>
        </Card>
      ) : (
        <ComparisonTable apis={apis} />
      )}
    </div>
  );
}
