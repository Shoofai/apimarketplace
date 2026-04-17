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

// POST /api/admin/blog/bulk
// Body: { ids: string[], action: 'publish' | 'unpublish' | 'archive' }
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { ids, action } = body as { ids: string[]; action: string };

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
  }
  if (!['publish', 'unpublish', 'archive'].includes(action)) {
    return NextResponse.json({ error: 'action must be publish, unpublish, or archive' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (action === 'publish') {
    updates.status = 'published';
    updates.published_at = new Date().toISOString();
  } else if (action === 'unpublish') {
    updates.status = 'draft';
    updates.published_at = null;
  } else {
    updates.status = 'archived';
  }

  const admin = createAdminClient();
  const { data, error } = await (admin as any)
    .from('blog_posts')
    .update(updates)
    .in('id', ids)
    .select('id, status, published_at');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ updated: data?.length ?? 0, posts: data });
}
