import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file || !type) {
      return NextResponse.json({ error: 'Missing file or type' }, { status: 400 });
    }

    if (!['logo', 'favicon'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Validate size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 2MB.' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use SVG, PNG, JPG, or ICO.' }, { status: 400 });
    }

    // Determine filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'svg';
    const filename = type === 'logo' ? `logo.${ext}` : `favicon.${ext}`;

    // Write to public directory
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicDir = path.join(process.cwd(), 'public');
    await writeFile(path.join(publicDir, filename), buffer);

    // If the extension changed (e.g. from .svg to .png), we need to update references
    // For now, we overwrite the same filename pattern

    return NextResponse.json({
      success: true,
      filename,
      message: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`
    });
  } catch (err) {
    console.error('Branding upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
