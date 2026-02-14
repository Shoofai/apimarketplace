import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

/**
 * List current user's favorite APIs.
 * GET /api/favorites
 */
export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const { data: rows, error } = await supabase
      .from('api_favorites')
      .select('api_id')
      .eq('user_id', context.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const apiIds = (rows ?? []).map((r) => r.api_id);
    if (apiIds.length === 0) {
      return NextResponse.json({ favorites: [], apis: [] });
    }

    const { data: apis, error: apisError } = await supabase
      .from('apis')
      .select(
        `
        id, name, slug, short_description, logo_url, avg_rating, total_reviews, total_subscribers,
        organization:organizations!apis_organization_id_fkey(name, slug, logo_url),
        category:api_categories(name, slug),
        pricing_plans:api_pricing_plans(price_monthly)
      `
      )
      .in('id', apiIds);

    if (apisError) {
      return NextResponse.json({ error: apisError.message }, { status: 500 });
    }

    const withMinMax = (apis ?? []).map((api: any) => {
      const prices = api.pricing_plans?.map((p: { price_monthly?: number }) => p.price_monthly ?? 0) ?? [];
      return {
        ...api,
        minPrice: prices.length ? Math.min(...prices) : undefined,
        maxPrice: prices.length ? Math.max(...prices) : undefined,
      };
    });

    return NextResponse.json({ favorites: rows, apis: withMinMax });
  } catch (e: unknown) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    throw e;
  }
}

/**
 * Add API to favorites.
 * POST /api/favorites
 * Body: { api_id: string }
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const body = await request.json();
    const api_id = body?.api_id;

    if (!api_id || typeof api_id !== 'string') {
      return NextResponse.json({ error: 'api_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('api_favorites')
      .insert({ user_id: context.user.id, api_id })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ favorited: true, favorite: { api_id } });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ favorited: true, favorite: data });
  } catch (e: unknown) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    throw e;
  }
}

/**
 * Remove API from favorites.
 * DELETE /api/favorites?api_id=...
 */
export async function DELETE(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const api_id = searchParams.get('api_id');

    if (!api_id) {
      return NextResponse.json({ error: 'api_id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('api_favorites')
      .delete()
      .eq('user_id', context.user.id)
      .eq('api_id', api_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ removed: true });
  } catch (e: unknown) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    throw e;
  }
}
