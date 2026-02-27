import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/bundles
 * List published bundles with included API items.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('api_bundles')
      .select(`
        *,
        api_bundle_items (
          id, sort_order,
          api:apis(id, name, logo_url, slug)
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ bundles: data ?? [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * POST /api/bundles
 * Create a new bundle. Requires admin or provider role.
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const body = await request.json();
    const {
      name,
      slug,
      description,
      logo_url,
      price_monthly,
      discount_percent = 0,
      tags = [],
      api_ids = [],
      is_platform_curated = false,
    } = body;

    if (!name || !slug || price_monthly == null) {
      return NextResponse.json({ error: 'name, slug, and price_monthly are required' }, { status: 400 });
    }

    const { data: bundle, error } = await supabase
      .from('api_bundles')
      .insert({
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        logo_url: logo_url || null,
        organization_id: is_platform_curated ? null : context.organization_id,
        price_monthly: Number(price_monthly),
        discount_percent: Number(discount_percent),
        tags,
        status: 'draft',
      } as any)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Insert bundle items
    if (Array.isArray(api_ids) && api_ids.length > 0) {
      const items = api_ids.map((api_id: string, idx: number) => ({
        bundle_id: bundle.id,
        api_id,
        sort_order: idx,
      }));
      await supabase.from('api_bundle_items').insert(items);
    }

    return NextResponse.json({ bundle }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
