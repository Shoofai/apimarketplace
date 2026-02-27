import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/provider/affiliate
 * Returns all affiliate links + commission stats for the current org.
 */
export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const [linksRes, commissionsRes] = await Promise.all([
      supabase
        .from('affiliate_links')
        .select('*, api:apis(id, name, slug, logo_url)')
        .eq('organization_id', context.organization_id)
        .order('created_at', { ascending: false }),
      supabase
        .from('provider_affiliate_commissions' as any)
        .select(`
          *,
          affiliate_link:affiliate_links!provider_affiliate_commissions_affiliate_link_id_fkey(
            code, organization_id
          )
        `)
        .eq('affiliate_link.organization_id', context.organization_id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    // Compute aggregate stats
    const links = linksRes.data ?? [];
    const commissions = commissionsRes.data ?? [];

    const stats = {
      total_links: links.length,
      total_clicks: links.reduce((s, l: any) => s + (l.click_count ?? 0), 0),
      total_conversions: links.reduce((s, l: any) => s + (l.conversion_count ?? 0), 0),
      pending_amount: commissions
        .filter((c: any) => c.status === 'pending')
        .reduce((s: number, c: any) => s + Number(c.commission_amount ?? 0), 0),
      approved_amount: commissions
        .filter((c: any) => c.status === 'approved')
        .reduce((s: number, c: any) => s + Number(c.commission_amount ?? 0), 0),
      paid_amount: commissions
        .filter((c: any) => c.status === 'paid')
        .reduce((s: number, c: any) => s + Number(c.commission_amount ?? 0), 0),
    };

    return NextResponse.json({ links, commissions, stats });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/provider/affiliate
 * Create a new affiliate link.
 * Body: { code, commission_percent, api_id?, landing_url? }
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const body = await request.json();
    const { code, commission_percent = 10, api_id, landing_url } = body;

    if (!code || typeof code !== 'string' || !/^[a-zA-Z0-9_-]{3,64}$/.test(code.trim())) {
      return NextResponse.json({ error: 'Invalid code. Use 3-64 alphanumeric characters.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('affiliate_links')
      .insert({
        organization_id: context.organization_id,
        code: code.trim(),
        commission_percent: Number(commission_percent),
        api_id: api_id || null,
        landing_url: landing_url || null,
        is_active: true,
        click_count: 0,
        conversion_count: 0,
      } as any)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This affiliate code is already in use.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ link: data }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
