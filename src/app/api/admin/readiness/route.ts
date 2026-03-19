import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/readiness
 * Returns Production Readiness Scanner results.
 *
 * In production (Vercel), reads from the `readiness_reports` table.
 * Locally, falls back to validation-context.json via fs.
 */
export async function GET() {
  try {
    await requirePlatformAdmin();

    // Production: read from Supabase
    const adminSb = createAdminClient();
    // Table added in migration 20260403000000 — cast until types are regenerated
    const { data, error } = await (adminSb as any)
      .from('readiness_reports')
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
        const filePath = process.env.VALIDATION_CONTEXT_PATH
          ? path.resolve(process.env.VALIDATION_CONTEXT_PATH)
          : path.join(process.cwd(), 'validation-context.json');
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return NextResponse.json(JSON.parse(content));
      } catch {
        // File not found locally
      }
    }

    if (error) {
      return NextResponse.json({ error: 'Failed to load readiness data' }, { status: 500 });
    }

    return NextResponse.json({ error: 'No validation context' }, { status: 404 });
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException & { message?: string };
    if (err?.message?.includes('Forbidden') || err?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to load validation context' }, { status: 500 });
  }
}
