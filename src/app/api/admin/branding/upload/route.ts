import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'branding';

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

    if (!['logo', 'logo-dark', 'favicon'].includes(type)) {
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

    // Determine filename stored in the bucket
    const ext = file.name.split('.').pop()?.toLowerCase() || 'svg';
    const filenameMap: Record<string, string> = {
      logo: `logo.${ext}`,
      'logo-dark': `logo-dark.${ext}`,
      favicon: `favicon.${ext}`,
    };
    const filename = filenameMap[type] || `logo.${ext}`;

    // Use admin client (service role) to bypass RLS for storage operations
    const adminClient = createAdminClient();

    // Ensure the branding bucket exists (public so logos can be served without auth)
    const { error: bucketError } = await adminClient.storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: allowedTypes,
      fileSizeLimit: 2 * 1024 * 1024,
    });

    // Ignore "already exists" errors
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Bucket creation error:', bucketError);
      return NextResponse.json({ error: 'Storage setup failed' }, { status: 500 });
    }

    // Upload (upsert) the file to the bucket
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await adminClient.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
        cacheControl: '0', // No cache so new uploads appear immediately
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Build the public URL
    const { data: urlData } = adminClient.storage.from(BUCKET).getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      filename,
      publicUrl: urlData.publicUrl,
      message: `${type === 'logo' ? 'Logo (light)' : type === 'logo-dark' ? 'Logo (dark)' : 'Favicon'} uploaded successfully`,
    });
  } catch (err) {
    console.error('Branding upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
