// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { explainCode } from '@/lib/ai/playground';
import { logger } from '@/lib/utils/logger';

/**
 * AI Code Explanation endpoint
 * POST /api/ai/explain
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = explainCode(
            code,
            language,
            context.user.id,
            context.organization_id
          );

          for await (const chunk of generator) {
            controller.enqueue(encoder.encode(chunk));
          }

          controller.close();
        } catch (error) {
          logger.error('AI explanation error', { error });
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
    logger.error('Explain API error', { error });
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
