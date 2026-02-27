import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/bundles/[id]
 * Bundle detail with items and computed savings.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: bundle, error } = await supabase
      .from('api_bundles')
      .select(`
        *,
        api_bundle_items (
          id, sort_order,
          api:apis(
            id, name, slug, logo_url, short_description,
            pricing_plans:api_pricing_plans(price_monthly),
            organization:organizations!apis_organization_id_fkey(name, slug)
          )
        )
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error || !bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    // Compute total individual price vs bundle price
    let individualTotal = 0;
    for (const item of bundle.api_bundle_items ?? []) {
      const plans = (item.api as any)?.pricing_plans ?? [];
      const prices = plans.map((p: { price_monthly?: number }) => p.price_monthly ?? 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      individualTotal += minPrice;
    }

    return NextResponse.json({
      bundle,
      computed: {
        individual_total: individualTotal,
        savings: Math.max(0, individualTotal - Number(bundle.price_monthly)),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * PATCH /api/bundles/[id]
 * Update a bundle (admin/org only).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('api_bundles')
      .update({ ...body, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ bundle: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
