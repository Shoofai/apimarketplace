import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/apis/[id]/versions
 * List all versions for an API. Returns api_versions rows, or a single synthetic version from apis table if none exist.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const { data: versions, error: versionsError } = await supabase
    .from('api_versions')
    .select('id, version, changelog, is_default, status, created_at')
    .eq('api_id', params.id)
    .order('created_at', { ascending: false });

  if (versionsError) {
    return NextResponse.json({ error: versionsError.message }, { status: 500 });
  }

  if (versions && versions.length > 0) {
    return NextResponse.json({ versions });
  }

  // No api_versions rows: return current version from apis table (MVP: single version)
  const { data: api, error: apiError } = await supabase
    .from('apis')
    .select('version, updated_at')
    .eq('id', params.id)
    .single();

  if (apiError || !api) {
    return NextResponse.json({ error: 'API not found' }, { status: 404 });
  }

  const version = (api as any).version || '1.0.0';
  return NextResponse.json({
    versions: [
      {
        id: null,
        version,
        changelog: null,
        is_default: true,
        status: 'active',
        created_at: (api as any).updated_at,
      },
    ],
  });
}
