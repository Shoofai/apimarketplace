// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { generateCode } from '@/lib/ai/playground';
import { parseOpenApiSpec } from '@/lib/utils/openapi-parser';
import { consumeAIGeneration } from '@/lib/ai/allotment';
import { logger } from '@/lib/utils/logger';

/**
 * AI Playground code generation endpoint
 * POST /api/ai/playground
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const { apiId, userPrompt, language, sessionId } = await request.json();

    const supabase = await createClient();

    // Get organization plan for allotment check
    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', context.organization_id)
      .single();

    const plan = org?.plan ?? 'free';

    // Check allotment / credit balance
    const { allowed, source } = await consumeAIGeneration(context.organization_id, plan);
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Daily AI limit reached. Purchase credits to continue.',
          buyCreditsUrl: '/dashboard/credits',
        },
        { status: 403 }
      );
    }

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
    const rawSpec = specData?.openapi_spec;
    const format = (specData?.openapi_spec_format || 'json') as 'yaml' | 'json';
    if (typeof rawSpec !== 'string') {
      return NextResponse.json(
        { error: 'API has no valid OpenAPI spec' },
        { status: 400 }
      );
    }
    const spec = await parseOpenApiSpec(rawSpec, format);

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
        'X-AI-Source': source ?? 'allotment',
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
