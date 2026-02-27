import { NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { buildApiEmbeddingText, upsertAPIEmbedding } from '@/lib/ai/embeddings';

export const dynamic = 'force-dynamic';

/**
 * POST /api/marketplace/embed-api
 * Admin route: generate/refresh embedding for one API.
 * Body: { api_id: string }
 */
export const POST = withPlatformAdmin(async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const apiId = body?.api_id;
  if (!apiId) {
    return NextResponse.json({ error: 'api_id required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: api, error } = await supabase
    .from('apis')
    .select('id, name, description, short_description, category:api_categories(name), tags')
    .eq('id', apiId)
    .single();

  if (error || !api) {
    return NextResponse.json({ error: 'API not found' }, { status: 404 });
  }

  const cat = Array.isArray((api as any).category) ? (api as any).category[0] : (api as any).category;
  const text = buildApiEmbeddingText({
    name: api.name,
    description: api.description,
    short_description: api.short_description,
    category: cat?.name ?? null,
    tags: (api as any).tags ?? null,
  });

  const ok = await upsertAPIEmbedding(api.id, text);
  if (!ok) {
    return NextResponse.json({ error: 'Embedding failed (OPENAI_API_KEY may be missing)' }, { status: 422 });
  }

  return NextResponse.json({ ok: true, api_id: api.id });
});
