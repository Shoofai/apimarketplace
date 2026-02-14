import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { NotFoundError } from '@/lib/utils/errors';

/**
 * GET /api/apis/[id]
 * Returns API details (e.g. base_url) for sandbox prefill. Allowed for published APIs or org-owned APIs.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    const { data: api, error } = await supabase
      .from('apis')
      .select('id, name, slug, base_url, status, organization_id')
      .eq('id', id)
      .single();

    if (error || !api) {
      throw new NotFoundError('API not found');
    }

    const isOwner = api.organization_id === context.organization_id;
    const isPublished = api.status === 'published';
    if (!isOwner && !isPublished) {
      throw new NotFoundError('API not found');
    }

    return NextResponse.json({ api });
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    throw e;
  }
}
