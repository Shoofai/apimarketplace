import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';

export type SiteMode = 'live' | 'prelaunch' | 'maintenance';

export interface SiteModeConfig {
  mode: SiteMode;
  message: string | null;
}

const DEFAULT: SiteModeConfig = { mode: 'live', message: null };

/**
 * Server-component getter (React cache — one fetch per request).
 * Do NOT use this in middleware; use getSiteModeForMiddleware instead.
 */
export const getSiteMode = cache(async (): Promise<SiteModeConfig> => {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'site_mode')
      .maybeSingle();

    const v = data?.value as { mode?: string; message?: string | null } | null;
    return {
      mode: (v?.mode as SiteMode) ?? 'live',
      message: v?.message ?? null,
    };
  } catch {
    return DEFAULT;
  }
});
