import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Admin auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();
  if (!userData?.is_platform_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    // Dynamic import to avoid bundling googleapis in client
    const { loadConfig } = await import('../../../../../blog-import/config');
    const { getGoogleClients } = await import('../../../../../blog-import/google-auth');

    const config = loadConfig();
    const { sheets } = await getGoogleClients(config.googleCredentialsPath);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.googleSheetId,
      range: `${config.sheetName}!A:E`,
    });

    const rawRows = res.data.values;
    if (!rawRows || rawRows.length < 2) {
      return NextResponse.json({ rows: [] });
    }

    const headers = (rawRows[0] as string[]).map((h: string) => h.toLowerCase().trim());
    const appIdx = headers.findIndex((h: string) => h.includes('application'));
    const orderIdx = headers.findIndex((h: string) => h.includes('order'));
    const catIdx = headers.findIndex((h: string) => h.includes('category'));
    const articleIdx = headers.findIndex((h: string) => h.includes('article'));
    const imageIdx = headers.findIndex((h: string) => h.includes('image'));

    const rows = rawRows
      .slice(1)
      .filter((row: string[]) => row[appIdx]?.trim() === config.appName)
      .map((row: string[]) => ({
        application: row[appIdx]?.trim() || '',
        order: parseInt(row[orderIdx]) || 0,
        category: row[catIdx]?.trim() || 'General',
        articleName: row[articleIdx]?.trim() || '',
        imageName: row[imageIdx]?.trim() || '',
      }));

    return NextResponse.json({ rows });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch manifest' },
      { status: 500 }
    );
  }
}
