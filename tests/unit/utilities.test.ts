import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Feature Flags
// ---------------------------------------------------------------------------

// Mock the Supabase admin client used by feature-flags
const mockMaybeSingle = vi.fn();
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

vi.mock('@/lib/utils/constants', () => ({
  DEFAULT_LIST_LIMIT: 50,
}));

import { getFeatureFlag } from '@/lib/utils/feature-flags';

describe('Feature Flags — getFeatureFlag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when flag is enabled via legacy schema (key/enabled)', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: { key: 'beta', enabled: true } });

    const result = await getFeatureFlag('beta');
    expect(result).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('feature_flags');
    expect(mockEq).toHaveBeenCalledWith('key', 'beta');
  });

  it('returns true when flag is enabled via new schema (name/enabled_globally)', async () => {
    // First lookup by key returns nothing
    mockMaybeSingle.mockResolvedValueOnce({ data: null });
    // Second lookup by name returns the flag
    mockMaybeSingle.mockResolvedValueOnce({
      data: { name: 'new_feature', enabled_globally: true },
    });

    const result = await getFeatureFlag('new_feature');
    expect(result).toBe(true);
  });

  it('returns false when flag is disabled', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { key: 'disabled_flag', enabled: false },
    });

    const result = await getFeatureFlag('disabled_flag');
    expect(result).toBe(false);
  });

  it('returns false when flag does not exist', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null });
    mockMaybeSingle.mockResolvedValueOnce({ data: null });

    const result = await getFeatureFlag('nonexistent');
    expect(result).toBe(false);
  });

  it('prefers enabled_globally over enabled when both exist', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { key: 'mixed', enabled: false, enabled_globally: true },
    });

    const result = await getFeatureFlag('mixed');
    expect(result).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// IP Utilities
// ---------------------------------------------------------------------------
import { isIpInCidr, isIpAllowed } from '@/lib/utils/ip';

describe('IP Utilities — isIpInCidr', () => {
  it('returns true when IP is within CIDR range', () => {
    expect(isIpInCidr('192.168.1.50', '192.168.1.0/24')).toBe(true);
  });

  it('returns false when IP is outside CIDR range', () => {
    expect(isIpInCidr('10.0.0.1', '192.168.1.0/24')).toBe(false);
  });

  it('returns true for exact IP match (no slash)', () => {
    expect(isIpInCidr('10.0.0.1', '10.0.0.1')).toBe(true);
  });

  it('returns false when exact IPs differ', () => {
    expect(isIpInCidr('10.0.0.2', '10.0.0.1')).toBe(false);
  });

  it('handles /32 single-host CIDR', () => {
    expect(isIpInCidr('172.16.0.5', '172.16.0.5/32')).toBe(true);
    expect(isIpInCidr('172.16.0.6', '172.16.0.5/32')).toBe(false);
  });
});

describe('IP Utilities — isIpAllowed', () => {
  it('allows all IPs when allowlist is empty', () => {
    expect(isIpAllowed('1.2.3.4', [])).toBe(true);
  });

  it('returns true when IP matches an entry', () => {
    expect(isIpAllowed('10.0.0.1', ['10.0.0.1', '192.168.0.0/16'])).toBe(true);
  });

  it('returns false when IP is not in any entry', () => {
    expect(isIpAllowed('8.8.8.8', ['10.0.0.0/8', '192.168.0.0/16'])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Environment Validation
// ---------------------------------------------------------------------------
import { validateRequiredEnvVars } from '@/lib/utils/env';

describe('Environment Validation — validateRequiredEnvVars', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clone env so we can mutate freely
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('reports missing required vars', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const { missing } = validateRequiredEnvVars();
    expect(missing).toContain('NEXT_PUBLIC_SUPABASE_URL');
    expect(missing).toContain('NEXT_PUBLIC_SITE_URL');
  });

  it('reports warnings for missing optional vars', () => {
    // Make sure required vars are set
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'key';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://site.com';

    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.SENTRY_DSN;

    const { warnings } = validateRequiredEnvVars();
    expect(warnings.some((w) => w.includes('STRIPE_SECRET_KEY'))).toBe(true);
    expect(warnings.some((w) => w.includes('SENTRY_DSN'))).toBe(true);
  });

  it('returns clean when all vars are set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'key';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://site.com';
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test';
    process.env.CRON_SECRET = 'cron';
    process.env.SENTRY_DSN = 'https://sentry.io/123';
    process.env.RESEND_API_KEY = 're_test';

    const { missing, warnings } = validateRequiredEnvVars();
    expect(missing).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });

  it('requires Kong vars when ENABLE_KONG is true', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'key';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://site.com';
    process.env.ENABLE_KONG = 'true';
    delete process.env.KONG_ADMIN_URL;
    delete process.env.KONG_PROXY_URL;

    const { missing } = validateRequiredEnvVars();
    expect(missing.some((m) => m.includes('KONG_ADMIN_URL'))).toBe(true);
    expect(missing.some((m) => m.includes('KONG_PROXY_URL'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Rate Limiter (in-memory)
// ---------------------------------------------------------------------------
vi.mock('@/lib/cache/redis', () => ({
  getRedisClient: vi.fn().mockResolvedValue(null),
}));

import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

function fakeRequest(ip: string): Request {
  return new Request('https://localhost/api/test', {
    headers: { 'x-forwarded-for': ip },
  });
}

describe('Rate Limiter — rateLimit (in-memory)', () => {
  it('allows requests under the limit', () => {
    const req = fakeRequest('100.0.0.1');
    const result = rateLimit(req, { limit: 5 });
    expect(result).toBeNull();
  });

  it('blocks requests over the limit', () => {
    const ip = '200.0.0.1';
    const config = { limit: 3, windowMs: 60_000 };

    for (let i = 0; i < 3; i++) {
      expect(rateLimit(fakeRequest(ip), config)).toBeNull();
    }

    const blocked = rateLimit(fakeRequest(ip), config);
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);
  });

  it('has different limits for auth vs analytics', () => {
    expect(RATE_LIMITS.auth.limit).toBe(10);
    expect(RATE_LIMITS.analytics.limit).toBe(60);
  });
});

// ---------------------------------------------------------------------------
// Circuit Breaker
// ---------------------------------------------------------------------------
vi.mock('@/lib/utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { CircuitBreaker } from '@/lib/resilience/circuit-breaker';

describe('Circuit Breaker', () => {
  it('starts in CLOSED state', () => {
    const cb = new CircuitBreaker('test', {
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 1,
    });
    expect(cb.currentState).toBe('CLOSED');
  });

  it('opens after failure threshold', async () => {
    const cb = new CircuitBreaker('test-open', {
      failureThreshold: 2,
      resetTimeoutMs: 5000,
      halfOpenMaxAttempts: 1,
    });

    const failing = () => Promise.reject(new Error('fail'));

    await expect(cb.execute(failing)).rejects.toThrow('fail');
    await expect(cb.execute(failing)).rejects.toThrow('fail');

    expect(cb.currentState).toBe('OPEN');
  });

  it('rejects calls when OPEN', async () => {
    const cb = new CircuitBreaker('test-reject', {
      failureThreshold: 1,
      resetTimeoutMs: 60_000,
      halfOpenMaxAttempts: 1,
    });

    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
    expect(cb.currentState).toBe('OPEN');

    await expect(cb.execute(() => Promise.resolve('ok'))).rejects.toThrow(
      'temporarily unavailable'
    );
  });

  it('transitions to HALF_OPEN after timeout and closes on success', async () => {
    const cb = new CircuitBreaker('test-half', {
      failureThreshold: 1,
      resetTimeoutMs: 50, // very short for test
      halfOpenMaxAttempts: 2,
    });

    // Trip the breaker
    await expect(cb.execute(() => Promise.reject(new Error('boom')))).rejects.toThrow();
    expect(cb.currentState).toBe('OPEN');

    // Wait for resetTimeout
    await new Promise((r) => setTimeout(r, 60));

    // Next call should transition to HALF_OPEN then CLOSED on success
    const result = await cb.execute(() => Promise.resolve('recovered'));
    expect(result).toBe('recovered');
    expect(cb.currentState).toBe('CLOSED');
  });
});
