import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/auth/admin';
import path from 'path';
import { spawnSync } from 'child_process';

/**
 * POST /api/admin/readiness/scan
 * Runs the production readiness scanner and writes validation-context.json.
 * Admin-only.
 */
export async function POST() {
  try {
    await requirePlatformAdmin();
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message?.includes('Forbidden') || err?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    throw error;
  }

  const projectRoot = process.cwd();
  const scannerPath = path.join(projectRoot, 'prod-readiness-scanner', 'dist', 'cli', 'index.js');

  try {
    const result = spawnSync(
      process.execPath,
      [scannerPath, 'scan', '--project', projectRoot, '--out', projectRoot, '--format', 'json,md', '--fail-on', 'CRITICAL'],
      {
        cwd: projectRoot,
        encoding: 'utf-8',
        timeout: 120_000,
      }
    );

    if (result.error) {
      return NextResponse.json(
        { error: 'Scanner failed to run', detail: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: result.status === 0,
      exitCode: result.status,
      stdout: result.stdout?.slice(-500) ?? '',
      stderr: result.stderr?.slice(-500) ?? '',
      message: result.status === 0 ? 'Scan complete. Refresh the dashboard.' : 'Scan found blocking findings.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Scan failed', detail: message }, { status: 500 });
  }
}
