import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Returns the custom OG image URL if an admin has uploaded one,
 * or null to fall back to the generated /opengraph-image route.
 */
export const getOgImageUrl = cache(async (): Promise<string | null> => {
  try {
    const supabase = createAdminClient();
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
    const query = supabase.from('app_settings').select('value').eq('key', 'og_image_url').maybeSingle()
      .then(({ data }) => data);
    const data = await Promise.race([query, timeout]);
    const value = data?.value as { url?: string } | null | undefined;
    return value?.url ?? null;
  } catch {
    return null;
  }
});
