import { NextResponse } from 'next/server';
import { parseOpenApiSpec } from '@/lib/utils/openapi-parser';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * POST /api/parse-openapi
 * Body: { spec: string, format: 'json' | 'yaml' }
 * Returns: { endpoints: number, baseUrl?: string, errors: string[], warnings: string[] }
 */
export async function POST(request: Request) {
  const rateLimited = rateLimit(request, RATE_LIMITS.parseOpenApi);
  if (rateLimited) return rateLimited;

  try {
    const { spec, format } = await request.json();
    if (!spec || typeof spec !== 'string') {
      return NextResponse.json({ error: 'spec is required' }, { status: 400 });
    }
    const fmt = format === 'yaml' ? 'yaml' : 'json';
    const parsed = await parseOpenApiSpec(spec, fmt);
    return NextResponse.json({
      endpoints: parsed.endpoints.length,
      baseUrl: parsed.info?.baseUrl,
      errors: parsed.errors,
      warnings: parsed.warnings,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Parse failed' },
      { status: 400 }
    );
  }
}
