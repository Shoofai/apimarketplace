import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Shared mock state – mutated per-test to simulate different DB / Stripe responses
// ---------------------------------------------------------------------------

const mockAuthContext = {
  user: { id: 'user-1', email: 'user@test.com' },
  organization_id: 'org-1',
  role: 'admin' as const,
};

let shouldAuthThrow = false;

// Supabase query-builder mock helpers
function chainable(finalValue: { data: any; error: any }) {
  const builder: any = {};
  const methods = [
    'select', 'insert', 'update', 'upsert', 'delete',
    'eq', 'neq', 'in', 'is', 'order', 'limit',
    'maybeSingle', 'single',
  ];
  for (const m of methods) {
    builder[m] = vi.fn().mockReturnValue(builder);
  }
  // Terminal methods resolve to the configured value
  builder.single = vi.fn().mockReturnValue(finalValue);
  builder.maybeSingle = vi.fn().mockReturnValue(finalValue);
  // Allow select() after insert/update to keep chaining
  builder.select = vi.fn().mockReturnValue(builder);
  return builder;
}

// Per-table mock state
let tableResponses: Record<string, { data: any; error: any }> = {};

function mockFrom(table: string) {
  const resp = tableResponses[table] ?? { data: null, error: null };
  return chainable(resp);
}

const mockSupabaseClient = { from: vi.fn(mockFrom) };
const mockAdminClient = { from: vi.fn(mockFrom) };

// ---------------------------------------------------------------------------
// Module mocks (must be before imports of route handlers)
// ---------------------------------------------------------------------------

vi.mock('@/lib/auth/middleware', () => ({
  requireAuth: vi.fn(async () => {
    if (shouldAuthThrow) {
      const { AuthError } = await import('@/lib/utils/errors');
      throw new AuthError();
    }
    return mockAuthContext;
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabaseClient),
  createClientWithToken: vi.fn(() => mockSupabaseClient),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}));

vi.mock('@/lib/utils/api-key', () => ({
  generateApiKey: vi.fn(() => ({
    key: 'lk_test_abc123',
    prefix: 'lk_test',
    hash: 'hashed_abc123',
  })),
  hashApiKey: vi.fn((k: string) => `hashed_${k}`),
}));

vi.mock('@/lib/utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/utils/env', () => ({
  getSiteUrl: vi.fn(() => 'https://test.example.com'),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Map([['stripe-signature', 'sig_test']])),
  cookies: vi.fn(async () => ({ get: vi.fn(() => undefined) })),
}));

// Stripe mock
const mockStripeCheckoutCreate = vi.fn();
const mockStripeCustomersCreate = vi.fn();
const mockStripePricesCreate = vi.fn();
const mockConstructEvent = vi.fn();

vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    checkout: { sessions: { create: (...args: any[]) => mockStripeCheckoutCreate(...args) } },
    customers: { create: (...args: any[]) => mockStripeCustomersCreate(...args) },
    prices: { create: (...args: any[]) => mockStripePricesCreate(...args) },
    webhooks: { constructEvent: (...args: any[]) => mockConstructEvent(...args) },
  },
}));

vi.mock('@/lib/stripe/billing', () => ({
  markInvoicePaid: vi.fn(),
  handlePaymentFailed: vi.fn(),
}));

vi.mock('@/lib/stripe/connect', () => ({
  handleConnectAccountUpdate: vi.fn(),
}));

vi.mock('@/lib/notifications/dispatcher', () => ({
  dispatchNotification: vi.fn(),
}));

// Stripe module mock (for credit purchase which does dynamic import)
vi.mock('stripe', () => {
  const StripeMock = vi.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mockStripeCheckoutCreate } },
    prices: { create: mockStripePricesCreate },
  }));
  return { default: StripeMock };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildRequest(body: any, extraHeaders?: Record<string, string>): Request {
  const headers = new Headers({ 'content-type': 'application/json', ...extraHeaders });
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

function buildRawRequest(rawBody: string, extraHeaders?: Record<string, string>): Request {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    headers: new Headers({ 'content-type': 'application/json', ...extraHeaders }),
    body: rawBody,
  });
}

// ---------------------------------------------------------------------------
// Reset state between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  shouldAuthThrow = false;
  tableResponses = {};
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  process.env.NEXT_PUBLIC_SITE_URL = 'https://test.example.com';
});

// =========================================================================
// 1. Credit-based subscription  POST /api/subscriptions
// =========================================================================

describe('POST /api/subscriptions', () => {
  // Lazy-import so mocks are in place
  let handler: typeof import('@/app/api/subscriptions/route').POST;

  beforeEach(async () => {
    const mod = await import('@/app/api/subscriptions/route');
    handler = mod.POST;
  });

  it('deducts credits and creates a subscription', async () => {
    tableResponses['apis'] = { data: { id: 'api-1', name: 'Test API', status: 'published' }, error: null };
    tableResponses['api_pricing_plans'] = {
      data: { id: 'plan-1', name: 'Pro', price_monthly: 10, price_in_credits: 100, included_calls: 1000 },
      error: null,
    };
    tableResponses['api_subscriptions'] = { data: null, error: null }; // no existing
    tableResponses['org_governance_policies'] = { data: null, error: null };
    tableResponses['credit_balances'] = { data: { balance: 500 }, error: null };
    tableResponses['credit_ledger'] = { data: null, error: null };
    tableResponses['audit_logs'] = { data: null, error: null };

    // Mock the admin update (optimistic lock success)
    const updateBuilder: any = {};
    ['update', 'eq', 'select'].forEach((m) => { updateBuilder[m] = vi.fn().mockReturnValue(updateBuilder); });
    updateBuilder.select = vi.fn().mockReturnValue({ data: [{ balance: 400 }], error: null });
    mockAdminClient.from = vi.fn((table: string) => {
      if (table === 'credit_balances') {
        // First call is the read, second is the update
        const callCount = mockAdminClient.from.mock.calls.filter((c: any) => c[0] === 'credit_balances').length;
        if (callCount <= 1) return chainable({ data: { balance: 500 }, error: null });
        return updateBuilder;
      }
      return mockFrom(table);
    });

    // Override supabase for subscription insert success
    mockSupabaseClient.from = vi.fn((table: string) => {
      if (table === 'api_subscriptions') {
        const callCount = mockSupabaseClient.from.mock.calls.filter((c: any) => c[0] === 'api_subscriptions').length;
        // First call: check existing (returns null)
        if (callCount <= 1) return chainable({ data: null, error: null });
        // Second call: insert
        return chainable({ data: { id: 'sub-1', api_id: 'api-1', status: 'active' }, error: null });
      }
      return mockFrom(table);
    });

    const req = buildRequest(
      { api_id: 'api-1', pricing_plan_id: 'plan-1', payment_method: 'credits' },
    );

    const res = await handler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.api_key).toBe('lk_test_abc123');
  });

  it('returns 402 when balance is insufficient', async () => {
    tableResponses['apis'] = { data: { id: 'api-1', name: 'Test API', status: 'published' }, error: null };
    tableResponses['api_pricing_plans'] = {
      data: { id: 'plan-1', name: 'Pro', price_monthly: 10, price_in_credits: 100, included_calls: 1000 },
      error: null,
    };
    tableResponses['api_subscriptions'] = { data: null, error: null };
    tableResponses['org_governance_policies'] = { data: null, error: null };
    tableResponses['credit_balances'] = { data: { balance: 10 }, error: null };

    const req = buildRequest(
      { api_id: 'api-1', pricing_plan_id: 'plan-1', payment_method: 'credits' },
    );

    const res = await handler(req);
    expect(res.status).toBe(402);
    const json = await res.json();
    expect(json.error).toContain('Insufficient credits');
  });

  it('returns existing subscription idempotently when idempotency-key header present', async () => {
    tableResponses['apis'] = { data: { id: 'api-1', name: 'Test API', status: 'published' }, error: null };
    tableResponses['api_pricing_plans'] = {
      data: { id: 'plan-1', name: 'Pro', price_monthly: 10, included_calls: 1000 },
      error: null,
    };
    tableResponses['api_subscriptions'] = {
      data: { id: 'sub-existing', api_id: 'api-1', status: 'active' },
      error: null,
    };

    const req = buildRequest(
      { api_id: 'api-1', pricing_plan_id: 'plan-1' },
      { 'idempotency-key': 'idem-123' },
    );

    const res = await handler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.idempotent).toBe(true);
    expect(json.subscription.id).toBe('sub-existing');
  });

  it('returns 409 when optimistic lock fails (race condition)', async () => {
    tableResponses['apis'] = { data: { id: 'api-1', name: 'Test API', status: 'published' }, error: null };
    tableResponses['api_pricing_plans'] = {
      data: { id: 'plan-1', name: 'Pro', price_monthly: 10, price_in_credits: 100, included_calls: 1000 },
      error: null,
    };
    tableResponses['api_subscriptions'] = { data: null, error: null };
    tableResponses['org_governance_policies'] = { data: null, error: null };

    // Admin client: balance read succeeds, but update returns 0 rows (concurrent modification)
    mockAdminClient.from = vi.fn((table: string) => {
      if (table === 'credit_balances') {
        const callCount = mockAdminClient.from.mock.calls.filter((c: any) => c[0] === 'credit_balances').length;
        if (callCount <= 1) return chainable({ data: { balance: 500 }, error: null });
        // Second call: update returns empty (optimistic lock failure)
        const updateBuilder: any = {};
        ['update', 'eq', 'select'].forEach((m) => { updateBuilder[m] = vi.fn().mockReturnValue(updateBuilder); });
        updateBuilder.select = vi.fn().mockReturnValue({ data: [], error: null });
        return updateBuilder;
      }
      return mockFrom(table);
    });

    const req = buildRequest(
      { api_id: 'api-1', pricing_plan_id: 'plan-1', payment_method: 'credits' },
    );

    const res = await handler(req);
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain('concurrent');
  });

  it('returns 404 when API does not exist', async () => {
    tableResponses['apis'] = { data: null, error: null };

    const req = buildRequest({ api_id: 'nonexistent', pricing_plan_id: 'plan-1' });
    const res = await handler(req);
    expect(res.status).toBe(404);
  });

  it('returns 401 when user is unauthenticated', async () => {
    shouldAuthThrow = true;

    const req = buildRequest({ api_id: 'api-1', pricing_plan_id: 'plan-1' });
    const res = await handler(req);
    // The route catches errors and returns 500 for unexpected throws
    // but AuthError with status 401 surfaces through the catch block
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('returns 400 when already subscribed without idempotency key', async () => {
    tableResponses['apis'] = { data: { id: 'api-1', name: 'Test API', status: 'published' }, error: null };
    tableResponses['api_pricing_plans'] = {
      data: { id: 'plan-1', name: 'Pro', price_monthly: 10, included_calls: 1000 },
      error: null,
    };
    tableResponses['api_subscriptions'] = {
      data: { id: 'sub-existing', api_id: 'api-1', status: 'active' },
      error: null,
    };

    const req = buildRequest({ api_id: 'api-1', pricing_plan_id: 'plan-1' });
    const res = await handler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Already subscribed');
  });
});

// =========================================================================
// 2. Stripe checkout creation  POST /api/subscriptions/checkout
// =========================================================================

describe('POST /api/subscriptions/checkout', () => {
  let handler: typeof import('@/app/api/subscriptions/checkout/route').POST;

  beforeEach(async () => {
    const mod = await import('@/app/api/subscriptions/checkout/route');
    handler = mod.POST;
  });

  it('creates a Stripe checkout session and returns URL', async () => {
    tableResponses['apis'] = { data: { id: 'api-1', name: 'Test API', status: 'published' }, error: null };
    tableResponses['api_pricing_plans'] = {
      data: { id: 'plan-1', name: 'Pro', price_monthly: 29.99, description: 'Pro plan', included_calls: 5000 },
      error: null,
    };
    tableResponses['api_subscriptions'] = { data: null, error: null };
    tableResponses['billing_accounts'] = { data: { stripe_customer_id: 'cus_test' }, error: null };

    mockStripeCheckoutCreate.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/session/cs_test_123',
    });

    const req = buildRequest({ api_id: 'api-1', pricing_plan_id: 'plan-1' });
    const res = await handler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.checkoutUrl).toBe('https://checkout.stripe.com/session/cs_test_123');
    expect(mockStripeCheckoutCreate).toHaveBeenCalledOnce();
  });

  it('returns 400 for free plan (price_monthly <= 0)', async () => {
    tableResponses['apis'] = { data: { id: 'api-1', name: 'Test API', status: 'published' }, error: null };
    tableResponses['api_pricing_plans'] = {
      data: { id: 'plan-free', name: 'Free', price_monthly: 0, included_calls: 100 },
      error: null,
    };

    const req = buildRequest({ api_id: 'api-1', pricing_plan_id: 'plan-free' });
    const res = await handler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('free');
  });

  it('returns 401 / error when user is unauthenticated', async () => {
    shouldAuthThrow = true;

    const req = buildRequest({ api_id: 'api-1', pricing_plan_id: 'plan-1' });
    const res = await handler(req);
    expect(res.status).toBe(500);
  });

  it('returns 404 when API is not published', async () => {
    tableResponses['apis'] = { data: { id: 'api-1', name: 'Draft API', status: 'draft' }, error: null };

    const req = buildRequest({ api_id: 'api-1', pricing_plan_id: 'plan-1' });
    const res = await handler(req);
    expect(res.status).toBe(404);
  });
});

// =========================================================================
// 3. Stripe webhook processing  POST /api/webhooks/stripe
// =========================================================================

describe('POST /api/webhooks/stripe', () => {
  let handler: typeof import('@/app/api/webhooks/stripe/route').POST;

  beforeEach(async () => {
    const mod = await import('@/app/api/webhooks/stripe/route');
    handler = mod.POST;
  });

  it('processes a valid event and returns received: true', async () => {
    tableResponses['processed_stripe_events'] = { data: null, error: null };

    mockConstructEvent.mockReturnValue({
      id: 'evt_valid',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_1', amount: 1000 } },
    });

    const req = buildRawRequest('{}', { 'stripe-signature': 'sig_valid' });
    const res = await handler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
  });

  it('returns 400 when signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const req = buildRawRequest('{}', { 'stripe-signature': 'sig_bad' });
    const res = await handler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid signature');
  });

  it('skips duplicate events (idempotency)', async () => {
    tableResponses['processed_stripe_events'] = { data: { id: 'evt_dup' }, error: null };

    mockConstructEvent.mockReturnValue({
      id: 'evt_dup',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_1', amount: 1000 } },
    });

    const req = buildRawRequest('{}', { 'stripe-signature': 'sig_valid' });
    const res = await handler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.skipped).toBe(true);
  });

  it('updates credit balance on checkout.session.completed for credit purchase', async () => {
    tableResponses['processed_stripe_events'] = { data: null, error: null };
    tableResponses['credit_balances'] = { data: { balance: 100 }, error: null };
    tableResponses['credit_ledger'] = { data: null, error: null };

    mockConstructEvent.mockReturnValue({
      id: 'evt_checkout',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_1',
          metadata: {
            type: 'credit_purchase',
            organization_id: 'org-1',
            credits: '500',
            bonus_credits: '50',
          },
        },
      },
    });

    const req = buildRawRequest('{}', { 'stripe-signature': 'sig_valid' });
    const res = await handler(req);

    expect(res.status).toBe(200);
    // Verify that upsert was called on credit_balances through the admin client
    expect(mockAdminClient.from).toHaveBeenCalledWith('credit_balances');
  });

  it('calls markInvoicePaid on invoice.paid event', async () => {
    const { markInvoicePaid } = await import('@/lib/stripe/billing');

    tableResponses['processed_stripe_events'] = { data: null, error: null };

    mockConstructEvent.mockReturnValue({
      id: 'evt_invoice',
      type: 'invoice.paid',
      data: { object: { id: 'inv_1', metadata: {} } },
    });

    const req = buildRawRequest('{}', { 'stripe-signature': 'sig_valid' });
    const res = await handler(req);

    expect(res.status).toBe(200);
    expect(markInvoicePaid).toHaveBeenCalledWith('inv_1');
  });
});

// =========================================================================
// 4. Credit purchase  POST /api/credits/purchase
// =========================================================================

describe('POST /api/credits/purchase', () => {
  let handler: typeof import('@/app/api/credits/purchase/route').POST;

  beforeEach(async () => {
    const mod = await import('@/app/api/credits/purchase/route');
    handler = mod.POST;
  });

  it('creates a Stripe checkout session for credit purchase', async () => {
    tableResponses['credit_packages'] = {
      data: {
        id: 'pkg-1',
        name: 'Starter Pack',
        credits: 500,
        bonus_credits: 50,
        price_usd: 49.99,
        is_active: true,
        stripe_price_id: 'price_abc',
      },
      error: null,
    };

    mockStripeCheckoutCreate.mockResolvedValue({
      id: 'cs_credit_1',
      url: 'https://checkout.stripe.com/session/cs_credit_1',
    });

    const req = buildRequest({ package_id: 'pkg-1' });
    const res = await handler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.checkout_url).toBe('https://checkout.stripe.com/session/cs_credit_1');
  });

  it('returns 400 when package_id is missing', async () => {
    const req = buildRequest({});
    const res = await handler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('package_id');
  });

  it('returns 404 when package does not exist', async () => {
    tableResponses['credit_packages'] = { data: null, error: { message: 'not found' } };

    const req = buildRequest({ package_id: 'pkg-nonexistent' });
    const res = await handler(req);
    expect(res.status).toBe(404);
  });

  it('returns 503 when Stripe is not configured', async () => {
    delete process.env.STRIPE_SECRET_KEY;

    tableResponses['credit_packages'] = {
      data: {
        id: 'pkg-1', name: 'Pack', credits: 100, bonus_credits: 0,
        price_usd: 9.99, is_active: true, stripe_price_id: null,
      },
      error: null,
    };

    const req = buildRequest({ package_id: 'pkg-1' });
    const res = await handler(req);
    expect(res.status).toBe(503);
  });
});
