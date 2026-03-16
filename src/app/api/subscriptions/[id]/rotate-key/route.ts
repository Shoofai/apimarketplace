import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { generateApiKey } from '@/lib/utils/api-key';
import { logger } from '@/lib/utils/logger';

/**
 * Rotates the API key for a subscription.
 * Returns the new plaintext key once — it is never stored.
 *
 * POST /api/subscriptions/[id]/rotate-key
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    // Verify subscription belongs to this org and is active
    const { data: sub } = await supabase
      .from('api_subscriptions')
      .select('id, status, organization_id')
      .eq('id', id)
      .eq('organization_id', context.organization_id)
      .single();

    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (sub.status !== 'active') {
      return NextResponse.json({ error: 'Only active subscriptions can be rotated' }, { status: 400 });
    }

    const { key, prefix, hash } = generateApiKey();

    await supabase
      .from('api_subscriptions')
      .update({
        api_key: hash,
        api_key_prefix: prefix,
      })
      .eq('id', id);

    await supabase.from('audit_logs').insert({
      user_id: context.user.id,
      organization_id: context.organization_id,
      action: 'api_key.rotated',
      resource_type: 'api_subscription',
      resource_id: id,
      status: 'success',
    });

    logger.info('API key rotated', { subscriptionId: id });

    // Return plaintext key once — it will not be stored
    return NextResponse.json({
      api_key: key,
      message: 'New API key generated. Save it now — it will not be shown again.',
    });
  } catch (error) {
    logger.error('Error rotating API key', { error });
    return NextResponse.json({ error: 'Failed to rotate key' }, { status: 500 });
  }
}
