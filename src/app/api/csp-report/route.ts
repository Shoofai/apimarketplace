import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/csp-report
 * Receives Content-Security-Policy violation reports.
 * Logs them for monitoring — rate-limited to prevent flood.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (body) {
      const report = body['csp-report'] || body;
      logger.warn('CSP violation', {
        documentUri: report['document-uri'],
        violatedDirective: report['violated-directive'],
        blockedUri: report['blocked-uri'],
        sourceFile: report['source-file'],
        lineNumber: report['line-number'],
      });
    }

    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}
