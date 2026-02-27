import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/auth/admin';
import type { CodeSnapshot } from '@/lib/deployment/types';
import { AdaptiveCheckGenerator } from '@/lib/deployment/check-generator';
import { CheckRunner } from '@/lib/deployment/runner';
import { ReportGenerator } from '@/lib/deployment/reporter';

/**
 * POST /api/admin/deployment/check
 * Body: { snapshot: CodeSnapshot }
 * Generates checks from snapshot, runs them, returns DiagnosticReport. Admin-only.
 */
export async function POST(req: Request) {
  try {
    await requirePlatformAdmin();
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let snapshot: CodeSnapshot;
  try {
    const body = await req.json();
    snapshot = body.snapshot as CodeSnapshot;
    if (!snapshot?.timestamp || !snapshot?.architecture) {
      return NextResponse.json(
        { error: 'Invalid body: snapshot required' },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  try {
    const generator = new AdaptiveCheckGenerator();
    const checks = generator.generateChecks(snapshot);
    const runner = new CheckRunner();
    const results = await runner.runChecks(checks);
    const reporter = new ReportGenerator();
    const report = reporter.generate(snapshot, results);
    await reporter.save(report, process.cwd());
    return NextResponse.json(report);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Check run failed';
    return NextResponse.json(
      { error: 'Check run failed', detail: message },
      { status: 500 }
    );
  }
}
