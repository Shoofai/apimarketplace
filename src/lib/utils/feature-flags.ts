import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

/**
 * Get feature flag value by name
 */
export async function getFeatureFlag(flagName: string): Promise<boolean> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('feature_flags')
    .select('enabled_globally')
    .eq('name', flagName)
    .single();

  if (error || !data) {
    return false;
  }

  return data.enabled_globally ?? false;
}

/**
 * Set feature flag value
 */
export async function setFeatureFlag(flagName: string, isEnabled: boolean): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from('feature_flags')
    .update({ enabled_globally: isEnabled })
    .eq('name', flagName);
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('feature_flags')
    .select('id, name, enabled_globally, description, enabled_for_orgs, enabled_for_plans')
    .order('name')
    .limit(DEFAULT_LIST_LIMIT);

  if (error) {
    return [];
  }

  return data;
}
