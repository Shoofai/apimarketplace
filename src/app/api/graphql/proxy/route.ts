import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/graphql/proxy
 * Proxies GraphQL queries to upstream APIs.
 * Body: { apiId, query, variables?, operationName? }
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const { apiId, query, variables, operationName } = await request.json();

    if (!apiId || !query) {
      return NextResponse.json({ error: 'apiId and query are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch API and verify access
    const { data: api } = await supabase
      .from('apis')
      .select('id, name, base_url, status, organization_id')
      .eq('id', apiId)
      .single();

    if (!api) {
      return NextResponse.json({ error: 'API not found' }, { status: 404 });
    }

    // Check subscription or ownership
    const isOwner = context.organization_id === api.organization_id;
    if (!isOwner && api.status !== 'published') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get subscriber's API key if not owner
    let apiKey: string | null = null;
    if (!isOwner) {
      const { data: sub } = await supabase
        .from('api_subscriptions')
        .select('api_key')
        .eq('api_id', apiId)
        .eq('organization_id', context.organization_id)
        .eq('status', 'active')
        .maybeSingle();
      apiKey = sub?.api_key ?? null;
    }

    // Forward GraphQL query to upstream
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) headers['X-API-Key'] = apiKey;

    const upstream = await fetch(api.base_url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables, operationName }),
      signal: AbortSignal.timeout(30_000),
    });

    const data = await upstream.json();

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    logger.error('GraphQL proxy error', { error });
    return NextResponse.json(
      { errors: [{ message: 'Failed to proxy GraphQL request' }] },
      { status: 500 }
    );
  }
}
