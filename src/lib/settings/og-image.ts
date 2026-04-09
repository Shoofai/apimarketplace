import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Returns the custom OG image URL if an admin has uploaded one,
 * or null to fall back to the generated /opengraph-image route.
 */
export const getOgImageUrl = cache(async (): Promise<string | null> => {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'og_image_url')
    .maybeSingle();

  const value = data?.value as { url?: string } | null;
  return value?.url ?? null;
});
