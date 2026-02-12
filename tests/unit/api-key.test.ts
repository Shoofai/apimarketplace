import { describe, it, expect } from 'vitest';
import { generateAPIKey, verifyAPIKey } from '@/lib/utils/api-key';

describe('API Key Utils', () => {
  it('should generate a valid API key', () => {
    const key = generateAPIKey('test');
    expect(key).toMatch(/^test_[A-Za-z0-9_-]{43}$/);
  });

  it('should verify correct API key', async () => {
    const key = generateAPIKey('test');
    const hash = await verifyAPIKey(key);
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');
  });

  it('should generate unique keys', () => {
    const key1 = generateAPIKey('test');
    const key2 = generateAPIKey('test');
    expect(key1).not.toBe(key2);
  });
});
