import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('is_platform_admin').eq('id', user.id).single();
  return data?.is_platform_admin ? user : null;
}

// PATCH /api/admin/blog/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const body = await req.json();
  const {
    status,
    title,
    slug,
    featured,
    category_id,
    // Extended content fields
    content,
    excerpt,
    author_name,
    tags,
    meta_title,
    meta_description,
    featured_image_url,
    reading_time_minutes,
  } = body;

  const updates: Record<string, unknown> = {};

  if (status !== undefined) {
    if (!['draft', 'published', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    updates.status = status;
    if (status === 'published') {
      updates.published_at = new Date().toISOString();
    } else if (status === 'draft') {
      updates.published_at = null;
    }
  }

  if (title !== undefined) updates.title = title;
  if (slug !== undefined) updates.slug = slug;
  if (featured !== undefined) updates.featured = featured;
  if (category_id !== undefined) updates.category_id = category_id;
  if (content !== undefined) updates.content = content;
  if (excerpt !== undefined) updates.excerpt = excerpt;
  if (author_name !== undefined) updates.author_name = author_name;
  if (tags !== undefined) updates.tags = tags;
  if (meta_title !== undefined) updates.meta_title = meta_title;
  if (meta_description !== undefined) updates.meta_description = meta_description;
  if (featured_image_url !== undefined) updates.featured_image_url = featured_image_url;
  if (reading_time_minutes !== undefined) updates.reading_time_minutes = reading_time_minutes;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await (admin as any)
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select('id, title, slug, status, published_at, featured, category_id, content, excerpt, author_name, tags, meta_title, meta_description, featured_image_url, reading_time_minutes, blog_categories(id, name, slug)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/admin/blog/[id] — soft-delete by archiving
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await (admin as any)
    .from('blog_posts')
    .update({ status: 'archived' })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
