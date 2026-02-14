import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { getPlatformName } from '@/lib/settings/platform-name';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `API Directory | Discover APIs | ${name}`,
    description: 'Browse the public API directory. Find REST APIs, SDKs, and integrations for your projects. Search by category, rating, and pricing.',
    openGraph: {
      title: `API Directory | ${name}`,
      description: 'Discover and integrate powerful APIs for your applications',
    },
  };
}

export default async function DirectoryPage() {
  const supabase = await createClient();
  const { data: apis } = await supabase
    .from('apis')
    .select('id, name, slug, short_description, avg_rating, total_reviews, total_subscribers, organization:organizations!apis_organization_id_fkey(name, slug)')
    .eq('status', 'published')
    .order('total_subscribers', { ascending: false })
    .limit(100);

  const list = apis ?? [];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'API Directory',
    description: 'Public directory of APIs',
    numberOfItems: list.length,
    itemListElement: list.slice(0, 20).map((api: { id: string; name: string; slug: string; short_description?: string }, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: (api as { name: string }).name,
        description: (api as { short_description?: string }).short_description,
        url: `https://app.example.com/marketplace/${(api as { organization?: { slug: string } }).organization?.slug ?? 'org'}/${(api as { slug: string }).slug}`,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">API Directory</h1>
          <p className="text-lg text-muted-foreground">
            Discover and integrate APIs. Browse by category on the marketplace.
          </p>
        </header>
        <nav className="mb-8">
          <Link href="/marketplace" className="text-primary hover:underline">Browse full marketplace →</Link>
        </nav>
        <ul className="space-y-4">
          {(list as unknown as { id: string; name: string; slug: string; short_description?: string; organization?: { name: string; slug: string } }[]).map((api) => (
            <li key={api.id}>
              <Link href={`/marketplace/${api.organization?.slug ?? 'org'}/${api.slug}`}>
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <h2 className="font-semibold text-lg">{api.name}</h2>
                    {api.short_description && <p className="text-muted-foreground text-sm mt-1">{api.short_description}</p>}
                    {api.organization && <p className="text-xs text-muted-foreground mt-2">by {api.organization.name}</p>}
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
