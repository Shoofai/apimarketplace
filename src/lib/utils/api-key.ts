import { randomBytes, createHash } from 'crypto';

/**
 * Generates a new API key with the specified format.
 * Format: amp_live_{32 hex chars} or amp_test_{32 hex chars}
 * 
 * @param isTest - Whether to generate a test key (default: false for live keys)
 * @returns Object containing the full key, prefix, and hash
 */
export function generateApiKey(isTest = false): { 
  key: string; 
  prefix: string; 
  hash: string;
} {
  const prefix = isTest ? 'amp_test_' : 'amp_live_';
  const randomPart = randomBytes(16).toString('hex'); // 32 hex characters
  const key = prefix + randomPart;
  const hash = createHash('sha256').update(key).digest('hex');
  
  return {
    key,
    prefix: key.substring(0, 12), // First 12 chars for lookup
    hash,
  };
}

/**
 * Hashes an API key using SHA-256.
 * Used to verify keys against stored hashes.
 * 
 * @param key - The API key to hash
 * @returns SHA-256 hash of the key
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Validates API key format.
 * 
 * @param key - The API key to validate
 * @returns true if the key format is valid
 */
export function isValidApiKeyFormat(key: string): boolean {
  const liveKeyRegex = /^amp_live_[a-f0-9]{32}$/;
  const testKeyRegex = /^amp_test_[a-f0-9]{32}$/;
  
  return liveKeyRegex.test(key) || testKeyRegex.test(key);
}

/**
 * Extracts the prefix from an API key for database lookup.
 * 
 * @param key - The API key
 * @returns The first 12 characters of the key
 */
export function extractApiKeyPrefix(key: string): string {
  return key.substring(0, 12);
}

/**
 * Masks an API key for display purposes.
 * Shows only the prefix and last 4 characters.
 * 
 * @param key - The API key to mask
 * @returns Masked key (e.g., "amp_live_***...***abc")
 */
export function maskApiKey(key: string): string {
  if (key.length < 16) return key;
  
  const prefix = key.substring(0, 12);
  const suffix = key.substring(key.length - 4);
  
  return `${prefix}***...***${suffix}`;
}
