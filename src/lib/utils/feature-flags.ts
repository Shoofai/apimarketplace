import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

/**
 * Get feature flag value.
 * Works with both schema variants:
 *   - New: columns `name`, `enabled_globally`
 *   - Legacy: columns `key`, `enabled`
 */
export async function getFeatureFlag(flagName: string): Promise<boolean> {
  const supabase = createAdminClient();

  // Use select('*') to avoid column-not-found errors, then read whichever column exists.
  // Try by `key` first (legacy schema), then by `name` (new schema).
  const { data: byKey } = await (supabase as any)
    .from('feature_flags')
    .select('*')
    .eq('key', flagName)
    .maybeSingle();

  if (byKey) {
    return byKey.enabled_globally ?? byKey.enabled ?? false;
  }

  const { data: byName } = await (supabase as any)
    .from('feature_flags')
    .select('*')
    .eq('name', flagName)
    .maybeSingle();

  if (byName) {
    return byName.enabled_globally ?? byName.enabled ?? false;
  }

  return false;
}

/**
 * Set feature flag value
 */
export async function setFeatureFlag(flagName: string, isEnabled: boolean): Promise<void> {
  const supabase = createAdminClient();

  // Update whichever column exists
  await (supabase as any)
    .from('feature_flags')
    .update({ enabled_globally: isEnabled, enabled: isEnabled })
    .eq('key', flagName);

  await (supabase as any)
    .from('feature_flags')
    .update({ enabled_globally: isEnabled, enabled: isEnabled })
    .eq('name', flagName);
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags() {
  const supabase = createAdminClient();

  const { data, error } = await (supabase as any)
    .from('feature_flags')
    .select('*')
    .limit(DEFAULT_LIST_LIMIT);

  if (error || !data) {
    return [];
  }

  return data;
}
