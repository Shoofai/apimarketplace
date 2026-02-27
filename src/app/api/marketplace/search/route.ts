import { NextRequest, NextResponse } from 'next/server';
import { searchAPIs } from '@/lib/api/search';

export const dynamic = 'force-dynamic';

/**
 * GET /api/marketplace/search
 * Public, unauthenticated marketplace search endpoint.
 * Used by the Kinetic CLI and VS Code extension.
 *
 * Query params:
 *   q          – search term (optional)
 *   category   – category slug filter
 *   sort       – popular | rating | newest | price_asc | price_desc
 *   page       – page number (default 1)
 *   limit      – results per page (default 20, max 50)
 *   free_only  – "true" to restrict to free APIs
 *   price_min  – minimum monthly price (USD)
 *   price_max  – maximum monthly price (USD)
 *   min_rating – minimum average rating
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const productTypeRaw = sp.get('product_type') ?? 'all';
    const productType = ['api', 'dataset', 'all'].includes(productTypeRaw)
      ? (productTypeRaw as 'api' | 'dataset' | 'all')
      : 'all';

    const result = await searchAPIs(sp.get('q') ?? '', {
      category: sp.get('category') ?? undefined,
      sort: (sp.get('sort') as any) ?? undefined,
      page: sp.get('page') ? parseInt(sp.get('page')!) : 1,
      limit: Math.min(sp.get('limit') ? parseInt(sp.get('limit')!) : 20, 50),
      freeOnly: sp.get('free_only') === 'true',
      priceMin: sp.get('price_min') ? parseFloat(sp.get('price_min')!) : undefined,
      priceMax: sp.get('price_max') ? parseFloat(sp.get('price_max')!) : undefined,
      minRating: sp.get('min_rating') ? parseFloat(sp.get('min_rating')!) : undefined,
      productType,
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Search failed' },
      { status: 500 }
    );
  }
}
