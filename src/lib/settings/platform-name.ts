import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';

const PLATFORM_NAME_KEY = 'platform_name';
const DEFAULT_PLATFORM_NAME = 'apinergy';

/**
 * Get the platform display name from admin settings (app_settings).
 * Used as the single source of truth for the application name across the app.
 * Defaults to "apinergy" if not set.
 */
export const getPlatformName = cache(async (): Promise<string> => {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', PLATFORM_NAME_KEY)
    .maybeSingle();

  const value = data?.value as { name?: string } | null;
  return value?.name ?? DEFAULT_PLATFORM_NAME;
});

export { PLATFORM_NAME_KEY, DEFAULT_PLATFORM_NAME };
