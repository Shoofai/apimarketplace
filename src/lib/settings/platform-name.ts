import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';

const PLATFORM_NAME_KEY = 'platform_name';
const DEFAULT_PLATFORM_NAME = 'LukeAPI';

/**
 * Get the platform display name from admin settings (app_settings).
 * Used as the single source of truth for the application name across the app.
 * Defaults to "LukeAPI" if not set.
 */
export const getPlatformName = cache(async (): Promise<string> => {
  try {
    const supabase = createAdminClient();
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
    const query = supabase.from('app_settings').select('value').eq('key', PLATFORM_NAME_KEY).maybeSingle()
      .then(({ data }) => data);
    const data = await Promise.race([query, timeout]);
    const value = data?.value as { name?: string } | null | undefined;
    return value?.name ?? DEFAULT_PLATFORM_NAME;
  } catch {
    return DEFAULT_PLATFORM_NAME;
  }
});

export { PLATFORM_NAME_KEY, DEFAULT_PLATFORM_NAME };
