import { NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug';
import { parseOpenApiSpec } from '@/lib/utils/openapi-parser';
import { logger } from '@/lib/utils/logger';
import { ForbiddenError } from '@/lib/utils/errors';

interface PricingPlanInput {
  name: string;
  price_monthly: number;
  description?: string | null;
  included_calls?: number | null;
  rate_limit_per_day?: number | null;
  features?: string[] | null;
}

/**
 * List published APIs (e.g. for workflows dropdown).
 * GET /api/apis?status=published
 */
export async function GET(request: Request) {
  try {
    await requireAuth();
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';

    const { data: apis, error } = await supabase
      .from('apis')
      .select('id, name, slug, base_url, status')
      .eq('status', status)
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ apis: apis ?? [] });
  } catch (e: unknown) {
    const { AuthError } = await import('@/lib/utils/errors');
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    throw e;
  }
}

/**
 * Creates a new API (draft) with optional endpoints and pricing plans.
 * POST /api/apis
 */
export async function POST(request: Request) {
  try {
    const context = await requirePermission('api.create');
    const supabase = await createClient();

    const body = await request.json();
    const {
      name,
      slug: slugInput,
      category_id,
      description,
      short_description,
      base_url,
      openapi_raw,
      openapi_format,
      pricing_plans = [],
      product_type = 'api',
      dataset_metadata,
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (product_type !== 'dataset' && (!base_url || typeof base_url !== 'string' || !base_url.trim())) {
      return NextResponse.json({ error: 'Base URL is required' }, { status: 400 });
    }

    // Ensure organization is provider
    const { data: org } = await supabase
      .from('organizations')
      .select('type, slug')
      .eq('id', context.organization_id)
      .single();

    if (!org || (org.type !== 'provider' && org.type !== 'both')) {
      throw new ForbiddenError('Organization must be a provider to create APIs');
    }

    // Unique slug for API (scoped by org in URL, but slug must be unique per API)
    const { data: existingApis } = await supabase
      .from('apis')
      .select('slug')
      .eq('organization_id', context.organization_id);
    const existingSlugs = (existingApis ?? []).map((a) => a.slug);
    const slug = slugInput?.trim()
      ? generateUniqueSlug(slugInput, existingSlugs)
      : generateUniqueSlug(name, existingSlugs);

    // Create API (draft); openapi data goes to api_specs
    const { data: api, error: apiError } = await supabase
      .from('apis')
      .insert({
        organization_id: context.organization_id,
        name: name.trim(),
        slug,
        category_id: category_id || null,
        description: description?.trim() || null,
        short_description: short_description?.trim() || description?.trim() || null,
        base_url: base_url?.trim() || null,
        status: 'draft',
        product_type: product_type || 'api',
        dataset_metadata: dataset_metadata ?? {},
      } as any)
      .select()
      .single();

    if (apiError) {
      logger.error('Failed to create API', { error: apiError });
      return NextResponse.json({ error: apiError.message }, { status: 500 });
    }

    // Store OpenAPI in api_specs
    if (openapi_raw != null && (typeof openapi_raw === 'string' || openapi_raw === '')) {
      const format = (openapi_format === 'yaml' ? 'yaml' : 'json') as 'yaml' | 'json';
      await supabase.from('api_specs').upsert(
        {
          api_id: api.id,
          openapi_raw: openapi_raw || null,
          openapi_spec_format: format,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'api_id' }
      );
    }

    // Parse OpenAPI and create endpoints if provided
    if (openapi_raw && typeof openapi_raw === 'string') {
      const format = (openapi_format === 'yaml' ? 'yaml' : 'json') as 'yaml' | 'json';
      try {
        const parsed = await parseOpenApiSpec(openapi_raw, format);
        if (parsed.endpoints.length > 0) {
          const endpoints = parsed.endpoints.map((ep) => ({
            api_id: api.id,
            method: ep.method,
            path: ep.path,
            summary: ep.summary || null,
            description: ep.description || null,
            parameters: ep.parameters ?? null,
            request_body: ep.requestBody ?? null,
            responses: ep.responses ?? null,
            tags: ep.tags ?? null,
            is_deprecated: ep.deprecated ?? false,
          }));
          await supabase.from('api_endpoints').insert(endpoints);
        }
      } catch (parseErr) {
        logger.warn('OpenAPI parse failed, API created without endpoints', { error: parseErr });
      }
    }

    // Create pricing plans
    if (Array.isArray(pricing_plans) && pricing_plans.length > 0) {
      const plans = (pricing_plans as PricingPlanInput[]).map((p, i) => ({
        api_id: api.id,
        name: p.name?.trim() || `Plan ${i + 1}`,
        slug: generateSlug(p.name?.trim() || `plan-${i + 1}`).replace(/^-+|-+$/g, '') || `plan-${i + 1}`,
        price_monthly: typeof p.price_monthly === 'number' ? p.price_monthly : 0,
        description: p.description?.trim() || null,
        included_calls: p.included_calls ?? null,
        rate_limit_per_day: p.rate_limit_per_day ?? null,
        features: Array.isArray(p.features) ? p.features : null,
        is_active: true,
        sort_order: i,
      }));
      const planSlugs = new Set<string>();
      const uniquePlans = plans.map((p) => {
        let s = p.slug;
        let c = 0;
        while (planSlugs.has(s)) {
          c++;
          s = `${p.slug}-${c}`;
        }
        planSlugs.add(s);
        return { ...p, slug: s };
      });
      await supabase.from('api_pricing_plans').insert(uniquePlans);
    }

    return NextResponse.json({ api, message: 'API created as draft' });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.error('Error creating API', { error });
    return NextResponse.json(
      { error: 'An error occurred while creating the API' },
      { status: 500 }
    );
  }
}
