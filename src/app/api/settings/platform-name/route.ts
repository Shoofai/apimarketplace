import { NextResponse } from 'next/server';
import { DEFAULT_PLATFORM_NAME, getPlatformName } from '@/lib/settings/platform-name';

/**
 * GET /api/settings/platform-name
 * Public. Returns the platform display name from admin settings.
 */
export async function GET() {
  try {
    const name = await getPlatformName();
    return NextResponse.json({ name });
  } catch {
    return NextResponse.json({ name: DEFAULT_PLATFORM_NAME }, { status: 200 });
  }
}
