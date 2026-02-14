import { NextResponse } from 'next/server';
import { getPlatformName } from '@/lib/settings/platform-name';

/**
 * GET /api/settings/platform-name
 * Public. Returns the platform display name from admin settings.
 */
export async function GET() {
  try {
    const name = await getPlatformName();
    return NextResponse.json({ name });
  } catch (e) {
    return NextResponse.json({ name: 'apinergy' }, { status: 200 });
  }
}
