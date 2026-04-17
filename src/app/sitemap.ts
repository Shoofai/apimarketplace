import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { HELP_ARTICLES } from '@/lib/help/articles';

// Avoid localhost URLs in production sitemap when the env var is misconfigured
const _envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl =
  _envSiteUrl && !_envSiteUrl.includes('localhost')
    ? _envSiteUrl
    : 'https://apimarketplace.pro';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  // Fetch published APIs for marketplace/docs pages
  const { data: apis } = await supabase
    .from('apis')
    .select('slug, updated_at, organization:organizations!apis_organization_id_fkey(slug)')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(2000);

  const apiUrls: MetadataRoute.Sitemap = (apis ?? []).map((api: any) => ({
    url: `${siteUrl}/marketplace/${api.organization?.slug ?? 'org'}/${api.slug}`,
    lastModified: api.updated_at ? new Date(api.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/marketplace`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/enterprise`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/directory`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/use-cases`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/security`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/status`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.5 },
    { url: `${siteUrl}/docs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/audit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/providers/onboard`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/help`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/changelog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    ...HELP_ARTICLES.map((a) => ({
      url: `${siteUrl}/help/${a.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    { url: `${siteUrl}/legal/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/legal/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/legal/sla`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/legal/cookies`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/legal/dpa`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/legal/acceptable-use`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Fetch published blog posts
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('slug, published_at, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(2000);

  const blogUrls: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...(blogPosts ?? []).map((post: any) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updated_at
        ? new Date(post.updated_at)
        : post.published_at
        ? new Date(post.published_at)
        : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];

  return [...staticPages, ...apiUrls, ...blogUrls];
}
