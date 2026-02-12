import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Get feature flag value
 */
export async function getFeatureFlag(flagKey: string): Promise<boolean> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('feature_flags')
    .select('is_enabled')
    .eq('flag_key', flagKey)
    .single();

  if (error || !data) {
    return false;
  }

  return data.is_enabled;
}

/**
 * Set feature flag value
 */
export async function setFeatureFlag(flagKey: string, isEnabled: boolean): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from('feature_flags')
    .update({ is_enabled: isEnabled })
    .eq('flag_key', flagKey);
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('feature_flags')
    .select('*')
    .order('flag_name');

  if (error) {
    return [];
  }

  return data;
}
