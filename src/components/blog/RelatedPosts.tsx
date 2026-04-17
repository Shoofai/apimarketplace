import { createAdminClient } from '@/lib/supabase/admin';
import { PostCard, type PostCardData } from './PostCard';

interface RelatedPostsProps {
  categoryId: string | null;
  currentSlug: string;
}

export async function RelatedPosts({ categoryId, currentSlug }: RelatedPostsProps) {
  if (!categoryId) return null;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('blog_posts')
      .select(`
        id, slug, title, excerpt, featured_image_url,
        published_at, author_name, reading_time_minutes, featured,
        blog_categories ( name, slug )
      `)
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .neq('slug', currentSlug)
      .order('published_at', { ascending: false })
      .limit(3);

    if (!data || data.length === 0) return null;

    const posts: PostCardData[] = data.map((p) => ({
      ...p,
      category: Array.isArray(p.blog_categories)
        ? (p.blog_categories[0] ?? null)
        : (p.blog_categories as { name: string; slug: string } | null),
    }));

    return (
      <section className="mt-12 border-t border-border pt-10">
        <h2 className="mb-6 text-xl font-bold text-foreground">Related Articles</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
