import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { parseCollection, extractBaseUrl } from '@/lib/import/collection-parser';

export const dynamic = 'force-dynamic';

/**
 * POST /api/import/collection
 * Accepts multipart/form-data:
 *   file   – the collection file (JSON text or .bru text)
 *   format – optional hint: postman | insomnia | bruno | auto
 *
 * Returns:
 *   matched   – marketplace APIs whose base_url matches a base URL in the collection
 *   unmatched – base URLs found in the collection that don't match any marketplace API
 *   collection – metadata about the parsed collection
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const supabase = await createClient();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const format = (formData.get('format') as string) ?? 'auto';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    if (!text.trim()) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    const collection = parseCollection(text, format !== 'auto' ? format : undefined);

    if (collection.requests.length === 0) {
      return NextResponse.json(
        { error: 'No requests found in collection. Supported formats: Postman v2.1, Insomnia v4, Bruno .bru', collection },
        { status: 422 }
      );
    }

    // Fetch all published APIs with their base URLs
    const { data: apis, error: apiErr } = await supabase
      .from('apis')
      .select(`
        id, name, slug, base_url, short_description, logo_url, avg_rating,
        organization:organizations!apis_organization_id_fkey(name, slug, logo_url),
        category:api_categories(name, slug)
      `)
      .eq('status', 'published')
      .not('base_url', 'is', null);

    if (apiErr) {
      return NextResponse.json({ error: apiErr.message }, { status: 500 });
    }

    // Build a lookup: base_url → api
    const apisByBase = new Map<string, typeof apis[number]>();
    for (const api of apis ?? []) {
      if (api.base_url) {
        const base = extractBaseUrl(api.base_url);
        if (base) apisByBase.set(base.toLowerCase(), api);
      }
    }

    const matched: {
      api: typeof apis[number];
      matchedBaseUrl: string;
      endpoints: { name: string; method: string; path: string }[];
    }[] = [];
    const matchedApiIds = new Set<string>();
    const unmatchedBaseUrls = new Set<string>(collection.baseUrls);

    for (const baseUrl of collection.baseUrls) {
      const normalised = baseUrl.toLowerCase();
      const api = apisByBase.get(normalised);
      if (api && !matchedApiIds.has(api.id)) {
        matchedApiIds.add(api.id);
        unmatchedBaseUrls.delete(baseUrl);

        // Collect endpoints that belong to this base URL
        const endpoints = collection.requests
          .filter((r) => {
            const reqBase = extractBaseUrl(r.url.replace(/\{\{[^}]+\}\}/g, 'placeholder'));
            return reqBase?.toLowerCase() === normalised;
          })
          .map((r) => {
            let path = r.url;
            try {
              const u = new URL(r.url.startsWith('http') ? r.url : `https://${r.url}`);
              path = u.pathname + (u.search ? u.search : '');
            } catch {}
            return { name: r.name, method: r.method, path };
          });

        matched.push({ api, matchedBaseUrl: baseUrl, endpoints });
      }
    }

    return NextResponse.json({
      collection: {
        name: collection.name,
        format: collection.format,
        total_requests: collection.requests.length,
        base_urls: collection.baseUrls,
      },
      matched,
      unmatched: Array.from(unmatchedBaseUrls),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
