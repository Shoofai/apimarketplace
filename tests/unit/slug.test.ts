import { describe, it, expect } from 'vitest';
import { generateSlug, ensureUniqueSlug } from '@/lib/utils/slug';

describe('Slug Generator', () => {
  it('should generate slug from text', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
    expect(generateSlug('API Marketplace Pro')).toBe('api-marketplace-pro');
    expect(generateSlug('Payment Gateway 2.0')).toBe('payment-gateway-2-0');
  });

  it('should handle special characters', () => {
    expect(generateSlug('Hello@World!')).toBe('hello-world');
    expect(generateSlug('Test & Demo API')).toBe('test-demo-api');
  });

  it('should handle multiple spaces', () => {
    expect(generateSlug('Hello    World')).toBe('hello-world');
  });

  it('should remove leading/trailing hyphens', () => {
    expect(generateSlug('-Hello World-')).toBe('hello-world');
  });

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('');
  });
});
