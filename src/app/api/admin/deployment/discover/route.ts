import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/auth/admin';
import { CodebaseDiscovery } from '@/lib/deployment/discovery';

/**
 * GET /api/admin/deployment/discover
 * Runs dynamic discovery and returns a fresh CodeSnapshot. Admin-only.
 */
export async function GET() {
  try {
    await requirePlatformAdmin();
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const discovery = new CodebaseDiscovery(process.cwd());
    const snapshot = await discovery.discover();
    await discovery.saveSnapshot(snapshot);
    return NextResponse.json(snapshot);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Discovery failed';
    return NextResponse.json(
      { error: 'Discovery failed', detail: message },
      { status: 500 }
    );
  }
}
