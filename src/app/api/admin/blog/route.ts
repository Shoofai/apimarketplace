import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('is_platform_admin').eq('id', user.id).single();
  return data?.is_platform_admin ? user : null;
}

// GET /api/admin/blog?status=draft&limit=100&offset=0
export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const url = req.nextUrl;
  const status = url.searchParams.get('status');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 100), 200);
  const offset = Number(url.searchParams.get('offset') ?? 0);

  let query = (admin as any)
    .from('blog_posts')
    .select('id, title, slug, status, published_at, created_at, featured, view_count, category_id, blog_categories(id, name, slug)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ posts: data ?? [], count: count ?? 0 });
}

const CreatePostSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(500).regex(/^[a-z0-9-]+$/),
  content: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  author_name: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional().nullable(),
  meta_title: z.string().max(200).optional().nullable(),
  meta_description: z.string().max(500).optional().nullable(),
  featured_image_url: z.string().url().optional().nullable(),
  reading_time_minutes: z.number().int().positive().optional().nullable(),
});

// POST /api/admin/blog — create a new post
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CreatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const fields = parsed.data;

  const admin = createAdminClient();

  // Check slug uniqueness
  const { data: existing } = await (admin as any)
    .from('blog_posts')
    .select('id')
    .eq('slug', fields.slug)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'A post with this slug already exists.' }, { status: 409 });
  }

  const insertData: Record<string, unknown> = {
    title: fields.title,
    slug: fields.slug,
    content: fields.content ?? null,
    excerpt: fields.excerpt ?? null,
    category_id: fields.category_id ?? null,
    author_name: fields.author_name ?? null,
    status: fields.status,
    featured: fields.featured,
    tags: fields.tags ?? null,
    meta_title: fields.meta_title ?? null,
    meta_description: fields.meta_description ?? null,
    featured_image_url: fields.featured_image_url ?? null,
    reading_time_minutes: fields.reading_time_minutes ?? null,
  };

  if (fields.status === 'published') {
    insertData.published_at = new Date().toISOString();
  }

  const { data, error } = await (admin as any)
    .from('blog_posts')
    .insert(insertData)
    .select('id, title, slug, status, published_at, created_at, featured, view_count, category_id, blog_categories(id, name, slug)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
