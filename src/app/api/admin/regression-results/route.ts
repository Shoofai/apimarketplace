// Call sites: Regression Dashboard (admin)
import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/auth/admin';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/admin/regression-results
 * Returns the latest regression test run summary (from test-results/regression-summary.json).
 * Written by scripts/write-regression-summary.ts after npm run test:e2e:regression.
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

  const summaryPath = path.join(process.cwd(), 'test-results', 'regression-summary.json');
  try {
    const raw = fs.readFileSync(summaryPath, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (e) {
    if ((e as NodeJS.ErrnoException)?.code === 'ENOENT') {
      return NextResponse.json(
        {
          lastRun: null,
          passed: 0,
          failed: 0,
          skipped: 0,
          total: 0,
          durationMs: 0,
          error: 'No regression run yet. Run: npm run test:e2e:regression',
          results: [],
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to read regression summary' },
      { status: 500 }
    );
  }
}
