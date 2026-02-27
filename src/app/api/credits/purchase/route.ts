import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/credits/purchase
 * Body: { package_id: string }
 *
 * Creates a Stripe Checkout Session for a credit package.
 * Returns { checkout_url }.
 *
 * The Stripe webhook handler (checkout.session.completed) then
 * credits the organization's balance.
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const body = await request.json();
    const { package_id } = body;

    if (!package_id) {
      return NextResponse.json({ error: 'package_id is required' }, { status: 400 });
    }

    // Fetch the credit package
    const { data: pkg, error } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .single();

    if (error || !pkg) {
      return NextResponse.json({ error: 'Credit package not found' }, { status: 404 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia' as any,
    });

    // Use stripe_price_id if set; otherwise create a one-time price on the fly
    let priceId: string;
    if (pkg.stripe_price_id) {
      priceId = pkg.stripe_price_id;
    } else {
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: Math.round(Number(pkg.price_usd) * 100),
        product_data: {
          name: `${pkg.name} — ${pkg.credits + pkg.bonus_credits} credits`,
        },
      });
      priceId = price.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard/credits?purchased=1`,
      cancel_url: `${siteUrl}/dashboard/credits`,
      metadata: {
        type: 'credit_purchase',
        organization_id: context.organization_id,
        package_id: pkg.id,
        credits: String(pkg.credits),
        bonus_credits: String(pkg.bonus_credits),
      },
    });

    return NextResponse.json({ checkout_url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
