import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';

export type HeroVariant = 'classic' | 'developer' | 'split';

const HERO_VARIANT_KEY = 'hero_variant';
const DEFAULT_HERO_VARIANT: HeroVariant = 'split';

const VALID_VARIANTS: HeroVariant[] = ['classic', 'developer', 'split'];

function isValidVariant(value: unknown): value is HeroVariant {
  return typeof value === 'string' && VALID_VARIANTS.includes(value as HeroVariant);
}

/**
 * Get the active hero variant from admin settings (app_settings).
 * Used on the public home page to render the selected hero design.
 * Defaults to "developer" if not set.
 */
export const getHeroVariant = cache(async (): Promise<HeroVariant> => {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', HERO_VARIANT_KEY)
    .maybeSingle();

  const value = data?.value as { variant?: unknown } | null;
  const variant = value?.variant;
  return isValidVariant(variant) ? variant : DEFAULT_HERO_VARIANT;
});

export { HERO_VARIANT_KEY, DEFAULT_HERO_VARIANT, VALID_VARIANTS };
