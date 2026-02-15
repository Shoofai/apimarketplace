import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import { DirectoryList, type DirectoryAPI } from './DirectoryList';

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
    .select(`
      id, name, slug, short_description, avg_rating, total_reviews, total_subscribers,
      organization:organizations!apis_organization_id_fkey(name, slug),
      category:api_categories(name)
    `)
    .eq('status', 'published')
    .order('total_subscribers', { ascending: false })
    .limit(100);

  const list: DirectoryAPI[] = (apis ?? []).map((api: Record<string, unknown>) => ({
    id: api.id as string,
    name: api.name as string,
    slug: api.slug as string,
    short_description: api.short_description as string | null,
    avg_rating: api.avg_rating as number | null,
    total_reviews: api.total_reviews as number | null,
    total_subscribers: api.total_subscribers as number | null,
    category_name: (api.category as { name: string } | null)?.name ?? null,
    organization: api.organization as { name: string; slug: string } | null,
  }));

  const categories = [...new Set(list.map((api) => api.category_name).filter(Boolean))] as string[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'API Directory',
    description: 'Public directory of APIs',
    numberOfItems: list.length,
    itemListElement: list.slice(0, 20).map((api, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: api.name,
        description: api.short_description,
        url: `https://app.example.com/marketplace/${api.organization?.slug ?? 'org'}/${api.slug}`,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        title="API Directory"
        subtitle="Discover and integrate APIs. Search by name, filter by category."
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav className="mb-6">
          <Link href="/marketplace" className="text-primary hover:underline text-sm font-medium">
            Browse full marketplace →
          </Link>
        </nav>
        <DirectoryList apis={list} categories={categories} />
      </div>
    </div>
  );
}
