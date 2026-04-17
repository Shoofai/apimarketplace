import { Suspense } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PostCard, type PostCardData } from '@/components/blog/PostCard';
import { BlogCategoryTabs, type CategoryTabData } from '@/components/blog/BlogCategoryTabs';
import { BlogSearchBar } from '@/components/blog/BlogSearchBar';
import { MarketplacePagination } from '@/components/marketplace/MarketplacePagination';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Blog | ${name}`,
    description: `Insights, tutorials, and product updates from the ${name} team.`,
  };
}

// ── Data ─────────────────────────────────────────────────────────────────────

async function getCategories(): Promise<CategoryTabData[]> {
  const supabase = createAdminClient();

  // Fetch all published posts with category to compute counts
  const { data } = await supabase
    .from('blog_posts')
    .select('category_id, blog_categories ( id, name, slug )')
    .eq('status', 'published');

  if (!data) return [];

  // Count by category
  const countMap = new Map<string, { name: string; slug: string; count: number }>();
  for (const p of data) {
    const cat = Array.isArray(p.blog_categories)
      ? (p.blog_categories[0] ?? null)
      : (p.blog_categories as { id: string; name: string; slug: string } | null);
    if (cat && p.category_id) {
      const existing = countMap.get(p.category_id);
      if (existing) {
        existing.count++;
      } else {
        countMap.set(p.category_id, { name: cat.name, slug: cat.slug, count: 1 });
      }
    }
  }

  return Array.from(countMap.values()).sort((a, b) => b.count - a.count);
}

async function getPosts(opts: {
  categorySlug?: string;
  query?: string;
  page: number;
}): Promise<{ posts: PostCardData[]; total: number }> {
  const supabase = createAdminClient();

  let categoryId: string | null = null;

  if (opts.categorySlug) {
    const { data: cat } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', opts.categorySlug)
      .maybeSingle();
    categoryId = cat?.id ?? null;
  }

  const offset = (opts.page - 1) * PAGE_SIZE;

  let query = supabase
    .from('blog_posts')
    .select(
      `
      id, slug, title, excerpt, featured_image_url,
      published_at, author_name, reading_time_minutes, featured,
      blog_categories ( name, slug )
    `,
      { count: 'exact' }
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (opts.query) {
    query = query.ilike('title', `%${opts.query}%`);
  }

  const { data, count } = await query;

  const posts: PostCardData[] = (data ?? []).map((p) => ({
    ...p,
    category: Array.isArray(p.blog_categories)
      ? (p.blog_categories[0] ?? null)
      : (p.blog_categories as { name: string; slug: string } | null),
  }));

  return { posts, total: count ?? 0 };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const categorySlug = sp.category;
  const query = sp.q?.trim();
  const page = Math.max(1, Number(sp.page ?? 1));

  const [categories, { posts, total }] = await Promise.all([
    getCategories(),
    getPosts({ categorySlug, query, page }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Featured posts on page 1 (only when no filter/search active)
  const showFeatured = page === 1 && !categorySlug && !query;
  const featured = showFeatured ? posts.filter((p) => p.featured).slice(0, 2) : [];
  const rest = showFeatured ? posts.filter((p) => !featured.includes(p)) : posts;

  function buildPageHref(p: number): string {
    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    if (query) params.set('q', query);
    if (p > 1) params.set('page', String(p));
    const s = params.toString();
    return `/blog${s ? `?${s}` : ''}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Blog</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
          Insights, tutorials, and updates from the LukeAPI team
        </p>
      </div>

      {/* Search + filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Suspense>
          <BlogSearchBar initialQuery={query} />
        </Suspense>
        <span className="text-sm text-muted-foreground">
          {total} article{total !== 1 ? 's' : ''}
          {categorySlug || query ? ' found' : ''}
        </span>
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="mb-10">
          <BlogCategoryTabs categories={categories} activeSlug={categorySlug} />
        </div>
      )}

      {/* No results */}
      {posts.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-lg text-muted-foreground">
            {query || categorySlug
              ? 'No articles match your search. Try different terms or clear the filters.'
              : 'No blog posts yet. Check back soon!'}
          </p>
        </div>
      )}

      {/* Featured hero */}
      {featured.length > 0 && (
        <div className="mb-12 grid gap-8 md:grid-cols-2">
          {featured.map((post) => (
            <PostCard key={post.id} post={post} large />
          ))}
        </div>
      )}

      {/* Post grid */}
      {rest.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12">
          <MarketplacePagination
            currentPage={page}
            totalPages={totalPages}
            buildPageHref={buildPageHref}
          />
        </div>
      )}
    </div>
  );
}
