import { createClient } from '@/lib/supabase/server';
import { hashApiKey } from '@/lib/utils/api-key';
import { logger } from '@/lib/utils/logger';

export interface ApiKeyContext {
  id: string;
  organization_id: string;
  user_id: string;
  scopes: string[];
  rate_limit_override?: number;
}

/**
 * Verifies an API key and returns its context.
 * Updates last_used_at timestamp.
 * 
 * @param key - The API key to verify
 * @returns API key context or null if invalid
 */
export async function verifyApiKey(key: string): Promise<ApiKeyContext | null> {
  try {
    const prefix = key.substring(0, 12);
    const hash = hashApiKey(key);

    const supabase = await createClient();
    
    // Find API key by prefix and hash
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_prefix', prefix)
      .eq('key_hash', hash)
      .is('revoked_at', null)
      .single();

    if (error || !apiKey) {
      logger.debug('API key not found', { prefix });
      return null;
    }

    // Check if expired
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      logger.debug('API key expired', { id: apiKey.id });
      return null;
    }

    // Update last_used_at (fire and forget)
    supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKey.id)
      .then(() => {
        logger.debug('Updated API key last_used_at', { id: apiKey.id });
      });

    return {
      id: apiKey.id,
      organization_id: apiKey.organization_id,
      user_id: apiKey.user_id,
      scopes: apiKey.scopes || ['read'],
      rate_limit_override: apiKey.rate_limit_override,
    };
  } catch (error) {
    logger.error('API key verification error', { error });
    return null;
  }
}

/**
 * Checks if an API key has a specific scope.
 * 
 * @param context - API key context from verifyApiKey
 * @param scope - Scope to check (e.g., 'read', 'write', 'admin')
 * @returns true if the key has the scope
 */
export function hasScope(context: ApiKeyContext, scope: string): boolean {
  return context.scopes.includes(scope) || context.scopes.includes('admin');
}
