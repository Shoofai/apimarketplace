import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getEmbedding } from '@/lib/ai/embeddings';

export const dynamic = 'force-dynamic';

/**
 * POST /api/marketplace/semantic-search
 * Natural language API discovery via pgvector.
 * Body: { query: string; limit?: number }
 *
 * Returns { apis: [...], mode: 'semantic' | 'unavailable' }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const query: string = typeof body?.query === 'string' ? body.query.trim() : '';
    const limit = Math.min(Number(body?.limit ?? 12), 40);

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ apis: [], mode: 'unavailable', reason: 'embedding_key_missing' });
    }

    // Embed the query
    const queryEmbedding = await getEmbedding(query);
    if (!queryEmbedding) {
      return NextResponse.json({ apis: [], mode: 'unavailable', reason: 'embedding_failed' });
    }

    const supabase = await createClient();

    // Call the semantic_search_apis RPC
    const { data: matches, error: rpcErr } = await supabase.rpc('semantic_search_apis', {
      query_embedding: JSON.stringify(queryEmbedding) as unknown,
      match_count: limit,
    });

    if (rpcErr) {
      return NextResponse.json({ error: rpcErr.message }, { status: 500 });
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({ apis: [], mode: 'semantic' });
    }

    const apiIds = (matches as { api_id: string; similarity: number }[]).map((m) => m.api_id);
    const similarityMap = Object.fromEntries(
      (matches as { api_id: string; similarity: number }[]).map((m) => [m.api_id, m.similarity])
    );

    // Fetch full API data
    const { data: apis, error: apisErr } = await supabase
      .from('apis')
      .select(`
        id, name, slug, short_description, description, avg_rating, total_subscribers, status, logo_url,
        organization:organizations!apis_organization_id_fkey(name, slug, logo_url),
        category:api_categories(name, slug),
        pricing_plans:api_pricing_plans(price_monthly)
      `)
      .in('id', apiIds)
      .in('status', ['published', 'unclaimed']);

    if (apisErr) {
      return NextResponse.json({ error: apisErr.message }, { status: 500 });
    }

    // Sort by similarity order
    const sorted = (apis ?? []).sort((a, b) => {
      const sa = similarityMap[a.id] ?? 0;
      const sb = similarityMap[b.id] ?? 0;
      return sb - sa;
    });

    return NextResponse.json({ apis: sorted, mode: 'semantic' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
