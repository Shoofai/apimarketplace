import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/auth/admin';
import path from 'path';
import fs from 'fs';

/**
 * GET /api/admin/readiness
 * Returns Production Readiness Scanner results from validation-context.json
 */
export async function GET() {
  try {
    await requirePlatformAdmin();

    const filePath = process.env.VALIDATION_CONTEXT_PATH
      ? path.resolve(process.env.VALIDATION_CONTEXT_PATH)
      : path.join(process.cwd(), 'validation-context.json');

    const content = await fs.promises.readFile(filePath, 'utf-8').catch(() => null);
    if (!content) {
      return NextResponse.json({ error: 'No validation context' }, { status: 404 });
    }

    const data = JSON.parse(content) as unknown;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException & { message?: string };
    if (err?.message?.includes('Forbidden') || err?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err?.code === 'ENOENT') {
      return NextResponse.json({ error: 'No validation context' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to load validation context' }, { status: 500 });
  }
}
