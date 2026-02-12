import { createAdminClient } from '@/lib/supabase/admin';

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

  return data.enabled_globally;
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
    .select('*')
    .order('name');

  if (error) {
    return [];
  }

  return data;
}
