import { NextResponse } from 'next/server';
import { getOptionalAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { generateSDK, SDK_LANGUAGE_META } from '@/lib/ai/sdk-generator';
import type { SDKLanguage } from '@/lib/ai/sdk-generator';

export const dynamic = 'force-dynamic';

const VALID_LANGUAGES: SDKLanguage[] = ['typescript', 'python', 'go'];

/**
 * POST /api/apis/[id]/sdk
 * Generate a typed SDK client for the API from its OpenAPI spec.
 * Body: { language: 'typescript' | 'python' | 'go' }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const language = (body?.language ?? 'typescript') as SDKLanguage;

    if (!VALID_LANGUAGES.includes(language)) {
      return NextResponse.json(
        { error: `Unsupported language. Choose one of: ${VALID_LANGUAGES.join(', ')}` },
        { status: 400 }
      );
    }

    const auth = await getOptionalAuth();
    const supabase = await createClient();

    // Fetch API — allow published APIs publicly; also allow org-member for draft/in_review
    const { data: api, error: apiErr } = await supabase
      .from('apis')
      .select('id, name, status, organization_id, api_specs(openapi_raw, openapi_spec_format)')
      .eq('id', id)
      .single();

    if (apiErr || !api) {
      return NextResponse.json({ error: 'API not found' }, { status: 404 });
    }

    const isPublic = api.status === 'published' || api.status === 'unclaimed';
    const isOwner = auth?.organization_id === api.organization_id;

    if (!isPublic && !isOwner) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const specRow = Array.isArray(api.api_specs) ? api.api_specs[0] : api.api_specs;
    const openApiRaw = specRow?.openapi_raw ?? null;

    if (!openApiRaw) {
      return NextResponse.json(
        { error: 'No OpenAPI spec available for this API' },
        { status: 422 }
      );
    }

    const sdk = await generateSDK(
      api.name,
      api.id,
      openApiRaw,
      language,
      auth?.user.id ?? null,
      auth?.organization_id ?? null
    );

    return NextResponse.json({
      code: sdk.code,
      language: sdk.language,
      filename: `${api.name.toLowerCase().replace(/\s+/g, '-')}-${SDK_LANGUAGE_META[language].filename}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
