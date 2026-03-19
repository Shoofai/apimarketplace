// Call sites: Regression Dashboard (admin)
import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/admin';

const EMPTY_SUMMARY = {
  lastRun: null,
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  durationMs: 0,
  error: 'No regression run yet. Run: npm run test:e2e:regression',
  results: [],
};

/**
 * GET /api/admin/regression-results
 * Returns the latest regression test run summary.
 *
 * In production (Vercel), reads from the `regression_summaries` table.
 * Locally, falls back to test-results/regression-summary.json via fs.
 */
export async function GET() {
  try {
    await requirePlatformAdmin();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Production: read from Supabase
  const adminSb = createAdminClient();
  // Table added in migration 20260403000000 — cast until types are regenerated
  const { data, error } = await (adminSb as any)
    .from('regression_summaries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data) {
    return NextResponse.json(data);
  }

  // Fallback for local dev: read from filesystem
  if (process.env.NODE_ENV === 'development') {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const summaryPath = path.join(process.cwd(), 'test-results', 'regression-summary.json');
      const raw = fs.readFileSync(summaryPath, 'utf-8');
      return NextResponse.json(JSON.parse(raw));
    } catch {
      // File not found locally — return empty
    }
  }

  if (error) {
    return NextResponse.json(
      { ...EMPTY_SUMMARY, error: 'Failed to read regression summary' },
      { status: 200 }
    );
  }

  return NextResponse.json(EMPTY_SUMMARY, { status: 200 });
}
