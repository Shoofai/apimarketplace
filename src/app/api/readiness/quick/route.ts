import { NextRequest, NextResponse } from 'next/server';
import { runSpecAudit } from '@/lib/readiness/spec-audit';
import yaml from 'yaml';

const FETCH_TIMEOUT_MS = 10_000;

function parseSpecInput(input: string): Record<string, unknown> {
  const trimmed = input.trim();
  if (trimmed.startsWith('{')) {
    return JSON.parse(trimmed) as Record<string, unknown>;
  }
  return yaml.parse(trimmed) as Record<string, unknown>;
}

/**
 * POST /api/readiness/quick
 * Public spec-only quick audit. Body: { specUrl?: string, spec?: object } (one required).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { specUrl, spec: specBody } = body as { specUrl?: string; spec?: Record<string, unknown> };

    let spec: Record<string, unknown>;

    if (specBody && typeof specBody === 'object' && !Array.isArray(specBody)) {
      spec = specBody;
    } else if (typeof specUrl === 'string' && specUrl.trim()) {
      const url = specUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return NextResponse.json({ error: 'Invalid spec URL' }, { status: 400 });
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch spec: ${res.status}` },
          { status: 400 }
        );
      }
      const text = await res.text();
      spec = parseSpecInput(text);
    } else {
      return NextResponse.json(
        { error: 'Provide either specUrl or spec (object)' },
        { status: 400 }
      );
    }

    const result = runSpecAudit(spec, 5);
    return NextResponse.json({
      score: result.score,
      gaps: result.gaps,
      topGaps: result.topGaps,
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON or YAML in spec' }, { status: 400 });
    }
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: 'Spec URL request timed out' }, { status: 408 });
    }
    const message = err instanceof Error ? err.message : 'Quick audit failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
