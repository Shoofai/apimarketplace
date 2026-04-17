import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { BlogAdminClient } from './BlogAdminClient';

export const metadata = {
  title: 'Blog Management',
  description: 'Manage blog posts — publish, unpublish, and organise content.',
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  created_at: string | null;
  featured: boolean | null;
  view_count: number | null;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  // Extended content fields (present when editing a post)
  content?: string | null;
  excerpt?: string | null;
  author_name?: string | null;
  tags?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
  featured_image_url?: string | null;
};

export default async function BlogAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();
  if (!userData?.is_platform_admin) redirect('/dashboard');

  const admin = createAdminClient();

  const { data: rawPosts } = await (admin as any)
    .from('blog_posts')
    .select('id, title, slug, status, published_at, created_at, featured, view_count, category_id, blog_categories(id, name, slug)')
    .order('created_at', { ascending: false })
    .limit(500) as { data: Array<{
      id: string;
      title: string;
      slug: string;
      status: string;
      published_at: string | null;
      created_at: string | null;
      featured: boolean | null;
      view_count: number | null;
      category_id: string | null;
      blog_categories: { id: string; name: string; slug: string } | null;
    }> | null };

  const posts: BlogPost[] = (rawPosts ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status ?? 'draft',
    published_at: p.published_at,
    created_at: p.created_at,
    featured: p.featured,
    view_count: p.view_count,
    category_id: p.category_id,
    category_name: p.blog_categories?.name ?? null,
    category_slug: p.blog_categories?.slug ?? null,
  }));

  const { data: rawCategories } = await (admin as any)
    .from('blog_categories')
    .select('id, name, slug')
    .order('name') as { data: Array<{ id: string; name: string; slug: string }> | null };

  return (
    <BlogAdminClient
      initialPosts={posts}
      categories={rawCategories ?? []}
    />
  );
}
