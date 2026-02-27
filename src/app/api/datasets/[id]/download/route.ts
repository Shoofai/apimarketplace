import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/datasets/[id]/download
 * Returns a signed download URL for a dataset.
 * Requires an active subscription to the dataset.
 *
 * For delivery_method = 'download': generates a Supabase Storage signed URL
 * or redirects to dataset_metadata.sample_url for publicly hosted files.
 * For delivery_method = 'stream': returns the stream endpoint URL.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    // Verify the resource is a dataset
    const { data: dataset, error } = await supabase
      .from('apis')
      .select('id, name, status, product_type, dataset_metadata, organization_id')
      .eq('id', id)
      .eq('product_type', 'dataset')
      .single();

    if (error || !dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    if (dataset.status !== 'published') {
      return NextResponse.json({ error: 'Dataset is not available' }, { status: 403 });
    }

    // Check for active subscription (OR: org owns the dataset)
    const isOwner = dataset.organization_id === context.organization_id;
    if (!isOwner) {
      const { data: sub } = await supabase
        .from('api_subscriptions')
        .select('id, status')
        .eq('api_id', id)
        .eq('organization_id', context.organization_id)
        .eq('status', 'active')
        .maybeSingle();

      if (!sub) {
        return NextResponse.json(
          { error: 'You must subscribe to this dataset to download it.' },
          { status: 403 }
        );
      }
    }

    const meta = (dataset.dataset_metadata ?? {}) as {
      delivery_method?: string;
      sample_url?: string;
      storage_path?: string;
      file_format?: string;
    };

    const deliveryMethod = meta.delivery_method ?? 'download';

    // Stream: return the stream endpoint URL
    if (deliveryMethod === 'stream') {
      const streamUrl = meta.sample_url ?? null;
      if (!streamUrl) {
        return NextResponse.json({ error: 'Stream endpoint not configured.' }, { status: 502 });
      }
      return NextResponse.json({ url: streamUrl, delivery_method: 'stream' });
    }

    // Download from Supabase Storage (storage_path set)
    if (meta.storage_path) {
      const admin = createAdminClient();
      const { data: signed, error: storageErr } = await admin.storage
        .from('datasets')
        .createSignedUrl(meta.storage_path, 3600); // 1 hour

      if (storageErr || !signed) {
        return NextResponse.json({ error: 'Could not generate download URL.' }, { status: 500 });
      }

      return NextResponse.json({
        url: signed.signedUrl,
        delivery_method: 'download',
        expires_in: 3600,
        file_format: meta.file_format,
      });
    }

    // Fallback: direct URL hosted externally
    if (meta.sample_url) {
      return NextResponse.redirect(meta.sample_url);
    }

    return NextResponse.json({ error: 'No download source configured for this dataset.' }, { status: 502 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
