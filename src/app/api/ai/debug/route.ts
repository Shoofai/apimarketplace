// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { debugError } from '@/lib/ai/playground';
import { logger } from '@/lib/utils/logger';

/**
 * AI Code Debugging endpoint
 * POST /api/ai/debug
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const { code, error, language } = await request.json();

    if (!code || !error || !language) {
      return NextResponse.json(
        { error: 'Code, error, and language are required' },
        { status: 400 }
      );
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = debugError(
            code,
            error,
            language,
            context.user.id,
            context.organization_id
          );

          for await (const chunk of generator) {
            controller.enqueue(encoder.encode(chunk));
          }

          controller.close();
        } catch (err) {
          logger.error('AI debugging error', { error: err });
          controller.error(err);
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
    logger.error('Debug API error', { error });
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
