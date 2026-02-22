// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { routeProvisioner } from '@/lib/kong/provisioner';
import { logger } from '@/lib/utils/logger';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';

/**
 * Publishes an API to the marketplace.
 * Updates status to 'published' and provisions in Kong Gateway.
 * 
 * POST /api/apis/[id]/publish
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Require api.publish permission
    const context = await requirePermission('api.publish');
    const supabase = await createClient();

    // Fetch API to verify ownership
    const { data: api, error: fetchError } = await supabase
      .from('apis')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !api) {
      throw new NotFoundError('API not found');
    }

    // Verify user's organization owns this API
    if (api.organization_id !== context.organization_id) {
      throw new ForbiddenError('Not authorized to publish this API');
    }

    // Check if API is already published
    if (api.status === 'published') {
      return NextResponse.json(
        { error: 'API is already published' },
        { status: 400 }
      );
    }

    // Validate API has required data before publishing
    if (!api.base_url) {
      return NextResponse.json(
        { error: 'API must have a base URL before publishing' },
        { status: 400 }
      );
    }

    // Check if API has at least one pricing plan
    const { data: pricingPlans } = await supabase
      .from('api_pricing_plans')
      .select('id')
      .eq('api_id', id)
      .limit(1);

    if (!pricingPlans || pricingPlans.length === 0) {
      return NextResponse.json(
        { error: 'API must have at least one pricing plan before publishing' },
        { status: 400 }
      );
    }

    // Update status to published
    const { data: updatedApi, error: updateError } = await supabase
      .from('apis')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to update API status', { error: updateError, apiId: id });
      throw updateError;
    }

    // Provision in Kong Gateway (if enabled)
    const kongEnabled = process.env.ENABLE_KONG === 'true';
    if (kongEnabled) {
      try {
        await routeProvisioner.provisionApi(id);
        logger.info('API provisioned in Kong', { apiId: id });
      } catch (kongError) {
        // Rollback status if Kong provisioning fails
        await supabase
          .from('apis')
          .update({ status: 'draft', published_at: null })
          .eq('id', id);

        logger.error('Kong provisioning failed, rolled back publish', {
          error: kongError,
          apiId: id,
        });

        return NextResponse.json(
          { error: 'Failed to provision API in gateway. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Log the publish action
    await supabase.from('audit_logs').insert({
      user_id: context.user.id,
      organization_id: context.organization_id,
      action: 'api.published',
      resource_type: 'api',
      resource_id: id,
      status: 'success',
      metadata: {
        api_name: api.name,
        kong_enabled: kongEnabled,
      },
    });

    return NextResponse.json({
      success: true,
      api: updatedApi,
      message: 'API successfully published to marketplace',
    });
  } catch (error) {
    logger.error('Error publishing API', { error, apiId: id });

    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while publishing the API' },
      { status: 500 }
    );
  }
}
