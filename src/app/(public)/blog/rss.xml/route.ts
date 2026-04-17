import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /blog/rss.xml
 * Returns a valid RSS 2.0 feed of the 50 most recent published blog posts.
 */
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();

  // Derive the canonical origin from the request so the feed works correctly
  // on any deployment URL without relying on a potentially misconfigured env var.
  const reqOrigin = request.nextUrl.origin;
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  // Prefer the env var only when it's explicitly set to a real host (not localhost)
  const siteUrl =
    envSiteUrl && !envSiteUrl.includes('localhost')
      ? envSiteUrl
      : reqOrigin;

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt, published_at, author_name, featured_image_url, blog_categories(name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50);

  function escapeXml(s: string) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  const items = (posts ?? [])
    .map((p) => {
      const cat = Array.isArray(p.blog_categories)
        ? (p.blog_categories[0] as { name: string } | undefined)
        : (p.blog_categories as { name: string } | null);

      const pubDate = p.published_at ? new Date(p.published_at).toUTCString() : '';
      const url = `${siteUrl}/blog/${p.slug}`;
      const description = escapeXml(p.excerpt ?? '');
      const title = escapeXml(p.title ?? '');

      return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      ${description ? `<description>${description}</description>` : ''}
      ${p.author_name ? `<author>${escapeXml(p.author_name)}</author>` : ''}
      ${cat?.name ? `<category>${escapeXml(cat.name)}</category>` : ''}
      ${p.featured_image_url ? `<enclosure url="${p.featured_image_url}" type="image/jpeg" length="0" />` : ''}
    </item>`.trim();
    })
    .join('\n  ');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LukeAPI Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Insights, tutorials, and updates from the LukeAPI team.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
