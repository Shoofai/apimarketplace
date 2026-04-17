import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Calendar, User, Tag, Clock } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { ViewTracker } from '@/components/blog/ViewTracker';

export const dynamic = 'force-dynamic';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  updated_at: string | null;
  author_name: string | null;
  reading_time_minutes: number | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  category_id: string | null;
  category: { name: string; slug: string } | null;
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        id, slug, title, excerpt, content, featured_image_url,
        published_at, updated_at, author_name, reading_time_minutes, tags,
        meta_title, meta_description, canonical_url, category_id,
        blog_categories ( name, slug )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error || !data) return null;

    return {
      ...data,
      category: Array.isArray(data.blog_categories)
        ? (data.blog_categories[0] ?? null)
        : (data.blog_categories as { name: string; slug: string } | null),
    };
  } catch {
    return null;
  }
}

async function getAdjacentPosts(currentSlug: string): Promise<{
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}> {
  try {
    const supabase = createAdminClient();
    const current = await supabase
      .from('blog_posts')
      .select('published_at')
      .eq('slug', currentSlug)
      .eq('status', 'published')
      .maybeSingle();

    if (!current.data?.published_at) return { prev: null, next: null };

    const publishedAt = current.data.published_at;

    const [prevRes, nextRes] = await Promise.all([
      supabase
        .from('blog_posts')
        .select('slug, title')
        .eq('status', 'published')
        .lt('published_at', publishedAt)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('blog_posts')
        .select('slug, title')
        .eq('status', 'published')
        .gt('published_at', publishedAt)
        .order('published_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      prev: prevRes.data ?? null,
      next: nextRes.data ?? null,
    };
  } catch {
    return { prev: null, next: null };
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lukeapi.com';

  return {
    title: post.meta_title ?? `${post.title} | LukeAPI Blog`,
    description:
      post.meta_description ??
      post.excerpt ??
      (post.content ?? '').slice(0, 160).replace(/\n/g, ' '),
    alternates: {
      canonical: post.canonical_url ?? `${siteUrl}/blog/${post.slug}`,
      types: {
        'application/rss+xml': `${siteUrl}/blog/rss.xml`,
      },
    },
    openGraph: {
      title: post.meta_title ?? post.title,
      description: post.meta_description ?? post.excerpt ?? undefined,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: post.author_name ? [post.author_name] : undefined,
      ...(post.featured_image_url ? { images: [post.featured_image_url] } : {}),
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, adjacent] = await Promise.all([getPost(slug), getAdjacentPosts(slug)]);

  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lukeapi.com';
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const content = post.content ?? '';

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description ?? post.excerpt ?? '',
    image: post.featured_image_url ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    author: post.author_name
      ? { '@type': 'Person', name: post.author_name }
      : { '@type': 'Organization', name: 'LukeAPI' },
    publisher: {
      '@type': 'Organization',
      name: 'LukeAPI',
      url: siteUrl,
    },
    url: postUrl,
  };

  return (
    <>
      {/* Reading progress bar */}
      <ReadingProgress />

      {/* View tracker */}
      <ViewTracker slug={post.slug} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-16">
          {/* ── Main content ── */}
          <article>
            {/* Hero image */}
            {post.featured_image_url && (
              <div className="relative mb-8 h-64 w-full overflow-hidden rounded-xl sm:h-96">
                <Image
                  src={post.featured_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Category + meta */}
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {post.category && (
                <Link
                  href={`/blog?category=${post.category.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  <Tag className="h-3 w-3" />
                  {post.category.name}
                </Link>
              )}
              {post.published_at && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
              {post.author_name && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.author_name}
                </span>
              )}
              {post.reading_time_minutes && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.reading_time_minutes} min read
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {post.title}
            </h1>

            {/* Share buttons */}
            <div className="mb-8">
              <ShareButtons url={postUrl} title={post.title} />
            </div>

            {/* Content */}
            <MarkdownRenderer content={content} />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Related posts */}
            <RelatedPosts categoryId={post.category_id} currentSlug={post.slug} />

            {/* Prev / Next */}
            <div className="mt-10 flex items-center justify-between border-t border-border pt-8">
              {adjacent.prev ? (
                <Link
                  href={`/blog/${adjacent.prev.slug}`}
                  className="group flex flex-col gap-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
                    ← Previous
                  </span>
                  <span className="font-medium group-hover:text-primary line-clamp-1 max-w-[220px]">
                    {adjacent.prev.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {adjacent.next ? (
                <Link
                  href={`/blog/${adjacent.next.slug}`}
                  className="group flex flex-col items-end gap-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
                    Next →
                  </span>
                  <span className="font-medium group-hover:text-primary line-clamp-1 max-w-[220px] text-right">
                    {adjacent.next.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </article>

          {/* ── Sidebar (TOC) ── */}
          <aside>
            <TableOfContents content={content} />
          </aside>
        </div>
      </div>
    </>
  );
}
