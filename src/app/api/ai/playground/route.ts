import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { generateCode } from '@/lib/ai/playground';
import { parseOpenApiSpec } from '@/lib/utils/openapi-parser';
import { logger } from '@/lib/utils/logger';

// Rate limits per tier (generations per day)
const RATE_LIMITS = {
  free: 50,
  pro: 200,
  enterprise: Infinity,
};

async function checkRateLimit(userId: string, organizationId: string): Promise<boolean> {
  const supabase = await createClient();

  // Get organization tier (assuming you have a plan field)
  const { data: org } = await supabase
    .from('organizations')
    .select('settings')
    .eq('id', organizationId)
    .single();

  const tier = (org?.settings as any)?.tier || 'free';
  const limit = RATE_LIMITS[tier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;

  if (limit === Infinity) return true;

  // Count usage in last 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const { count } = await supabase
    .from('ai_usage_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', 'playground')
    .gte('created_at', yesterday.toISOString());

  return (count || 0) < limit;
}

/**
 * AI Playground code generation endpoint
 * POST /api/ai/playground
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const { apiId, userPrompt, language, sessionId } = await request.json();

    // Check rate limit
    const withinLimit = await checkRateLimit(context.user.id, context.organization_id);
    if (!withinLimit) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Upgrade your plan for more AI generations.' },
        { status: 429 }
      );
    }

    const supabase = await createClient();

    // Fetch API details (openapi_spec from api_specs)
    const { data: api } = await supabase
      .from('apis')
      .select('*, subscriptions:api_subscriptions(*), api_specs(openapi_spec, openapi_spec_format)')
      .eq('id', apiId)
      .single();

    if (!api) {
      return NextResponse.json({ error: 'API not found' }, { status: 404 });
    }

    // Get user's subscription to get their API key
    const subscription = api.subscriptions?.find(
      (sub: any) => sub.organization_id === context.organization_id && sub.status === 'active'
    );

    if (!subscription) {
      return NextResponse.json(
        { error: 'You must subscribe to this API first' },
        { status: 403 }
      );
    }

    const specRow = (api as { api_specs?: { openapi_spec?: unknown; openapi_spec_format?: string }[] | { openapi_spec?: unknown; openapi_spec_format?: string } }).api_specs;
    const specData = Array.isArray(specRow) ? specRow[0] : specRow;
    const spec = await parseOpenApiSpec(specData?.openapi_spec, specData?.openapi_spec_format || 'json');

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = generateCode(
            {
              apiId,
              apiKey: subscription.api_key_prefix, // In production, decrypt actual key
              spec,
              language: language || 'javascript',
            },
            userPrompt,
            context.user.id,
            context.organization_id,
            sessionId
          );

          for await (const chunk of generator) {
            controller.enqueue(encoder.encode(chunk));
          }

          controller.close();
        } catch (error) {
          logger.error('AI generation error', { error });
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    logger.error('Playground API error', { error });
    return NextResponse.json(
      { error: 'An error occurred while generating code' },
      { status: 500 }
    );
  }
}
