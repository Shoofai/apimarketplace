import { NextResponse } from 'next/server';
import { getOptionalAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/apis/[id]/graphql-schema
 * Returns the GraphQL schema SDL for an API.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getOptionalAuth();
    const supabase = await createClient();

    const { data: api } = await supabase
      .from('apis')
      .select('id, status, organization_id, base_url')
      .eq('id', id)
      .single();

    if (!api) {
      return NextResponse.json({ error: 'API not found' }, { status: 404 });
    }

    const isPublic = api.status === 'published';
    const isOwner = auth?.organization_id === api.organization_id;
    if (!isPublic && !isOwner) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Check for stored schema
    const { data: config } = await (supabase as any)
      .from('api_graphql_configs')
      .select('schema_sdl, introspection_enabled')
      .eq('api_id', id)
      .maybeSingle();

    if (config?.schema_sdl) {
      return NextResponse.json({ schema: config.schema_sdl });
    }

    // Try introspection if enabled
    if (config?.introspection_enabled !== false) {
      try {
        const introspectionQuery = `{ __schema { types { name kind fields { name type { name kind } } } } }`;
        const res = await fetch(api.base_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: introspectionQuery }),
          signal: AbortSignal.timeout(10_000),
        });
        const data = await res.json();
        if (data?.data?.__schema) {
          return NextResponse.json({ schema: data.data.__schema, source: 'introspection' });
        }
      } catch {
        // Introspection failed — return empty
      }
    }

    return NextResponse.json({ schema: null, message: 'No schema available' });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch schema' }, { status: 500 });
  }
}
