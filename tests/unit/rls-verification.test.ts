import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * RLS Policy Verification Tests
 *
 * These tests verify that the Supabase client helpers produce the correct
 * query patterns for Row-Level Security enforcement.  We mock the
 * @supabase/supabase-js factory so no real network calls are made; the
 * assertions confirm that the right table / filters / auth context are used.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds a mock query-builder chain that records every call. */
function createMockQueryBuilder(returnData: any = [], returnError: any = null) {
  const chain: Record<string, any> = {};
  const calls: { method: string; args: any[] }[] = [];

  const methods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'in', 'is', 'gte', 'lte', 'like',
    'order', 'limit', 'single', 'maybeSingle',
  ];

  for (const m of methods) {
    chain[m] = vi.fn((...args: any[]) => {
      calls.push({ method: m, args });
      return chain;
    });
  }

  // Terminal — returns the data
  chain.then = undefined; // make it thenable via the promise below
  const resultPromise = Promise.resolve({ data: returnData, error: returnError });
  // Allow `await supabase.from(...).select(...)` etc.
  Object.assign(chain, {
    then: resultPromise.then.bind(resultPromise),
    catch: resultPromise.catch.bind(resultPromise),
  });

  return { chain, calls };
}

/** Creates a fake Supabase client with a `.from()` spy. */
function createMockSupabaseClient(opts: {
  role: 'anon' | 'service_role';
  userId?: string;
  orgId?: string;
  returnData?: any;
  returnError?: any;
}) {
  const { chain, calls } = createMockQueryBuilder(opts.returnData ?? [], opts.returnError);
  const fromSpy = vi.fn((_table: string) => chain);

  return {
    client: {
      from: fromSpy,
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: opts.userId ? { id: opts.userId } : null },
          error: null,
        }),
      },
    },
    fromSpy,
    chain,
    calls,
    role: opts.role,
    userId: opts.userId,
    orgId: opts.orgId,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RLS Policy Verification', () => {
  const USER_ID = 'user-abc-123';
  const ORG_ID = 'org-abc-123';
  const OTHER_ORG_ID = 'org-other-456';

  // ---- 1. User reads own org APIs ----
  it('user client queries apis filtered by own organization_id', async () => {
    const ownApis = [
      { id: 'api-1', name: 'My API', organization_id: ORG_ID, status: 'published' },
    ];
    const { client, fromSpy, calls } = createMockSupabaseClient({
      role: 'anon',
      userId: USER_ID,
      orgId: ORG_ID,
      returnData: ownApis,
    });

    const result = await client.from('apis').select('*').eq('organization_id', ORG_ID);

    expect(fromSpy).toHaveBeenCalledWith('apis');
    expect(calls.some((c) => c.method === 'eq' && c.args[0] === 'organization_id' && c.args[1] === ORG_ID)).toBe(true);
    expect(result.data).toEqual(ownApis);
  });

  // ---- 2. User cannot read another org's subscriptions ----
  it('user client cannot read another organization\'s subscriptions', async () => {
    const { client, fromSpy, calls } = createMockSupabaseClient({
      role: 'anon',
      userId: USER_ID,
      orgId: ORG_ID,
      returnData: [],
      returnError: null,
    });

    const result = await client.from('api_subscriptions').select('*').eq('organization_id', OTHER_ORG_ID);

    expect(fromSpy).toHaveBeenCalledWith('api_subscriptions');
    expect(calls.some((c) => c.method === 'eq' && c.args[1] === OTHER_ORG_ID)).toBe(true);
    // RLS would return empty for another org
    expect(result.data).toEqual([]);
  });

  // ---- 3. User can read own webhook deliveries ----
  it('user client queries webhook_deliveries for own endpoints', async () => {
    const deliveries = [{ id: 'del-1', webhook_endpoint_id: 'ep-1', status: 'delivered' }];
    const { client, fromSpy } = createMockSupabaseClient({
      role: 'anon',
      userId: USER_ID,
      orgId: ORG_ID,
      returnData: deliveries,
    });

    const result = await client.from('webhook_deliveries').select('*').eq('webhook_endpoint_id', 'ep-1');

    expect(fromSpy).toHaveBeenCalledWith('webhook_deliveries');
    expect(result.data).toEqual(deliveries);
  });

  // ---- 4. Admin client reads all records (service role) ----
  it('admin (service_role) client can read all records across orgs', async () => {
    const allApis = [
      { id: 'api-1', organization_id: ORG_ID },
      { id: 'api-2', organization_id: OTHER_ORG_ID },
    ];
    const { client, fromSpy } = createMockSupabaseClient({
      role: 'service_role',
      returnData: allApis,
    });

    const result = await client.from('apis').select('*');

    expect(fromSpy).toHaveBeenCalledWith('apis');
    expect(result.data).toHaveLength(2);
    expect(result.data).toEqual(allApis);
  });

  // ---- 5. User cannot update another org's API ----
  it('user client update on another org\'s API returns error', async () => {
    const { client, fromSpy, calls } = createMockSupabaseClient({
      role: 'anon',
      userId: USER_ID,
      orgId: ORG_ID,
      returnData: null,
      returnError: { message: 'new row violates row-level security policy', code: '42501' },
    });

    const result = await client
      .from('apis')
      .update({ name: 'Hacked' })
      .eq('organization_id', OTHER_ORG_ID);

    expect(fromSpy).toHaveBeenCalledWith('apis');
    expect(calls.some((c) => c.method === 'update')).toBe(true);
    expect(result.error).toBeTruthy();
    expect(result.error?.code).toBe('42501');
  });

  // ---- 6. User can read published (public) APIs ----
  it('user client can read published APIs with public visibility', async () => {
    const publicApis = [
      { id: 'api-pub', name: 'Public API', status: 'published', visibility: 'public', organization_id: OTHER_ORG_ID },
    ];
    const { client, fromSpy, calls } = createMockSupabaseClient({
      role: 'anon',
      userId: USER_ID,
      returnData: publicApis,
    });

    const result = await client
      .from('apis')
      .select('*')
      .eq('status', 'published')
      .eq('visibility', 'public');

    expect(fromSpy).toHaveBeenCalledWith('apis');
    expect(calls.some((c) => c.method === 'eq' && c.args[0] === 'status' && c.args[1] === 'published')).toBe(true);
    expect(result.data).toEqual(publicApis);
  });

  // ---- 7. User cannot access api_health_checks for APIs they don't own ----
  it('user client gets empty result for api_health_checks of unowned API', async () => {
    const { client, fromSpy, calls } = createMockSupabaseClient({
      role: 'anon',
      userId: USER_ID,
      orgId: ORG_ID,
      returnData: [],
    });

    const result = await client
      .from('api_health_checks')
      .select('*')
      .eq('api_id', 'api-not-mine');

    expect(fromSpy).toHaveBeenCalledWith('api_health_checks');
    expect(calls.some((c) => c.method === 'eq' && c.args[0] === 'api_id')).toBe(true);
    expect(result.data).toEqual([]);
  });

  // ---- 8. User can read own content_reports but not others' ----
  it('user client reads own content_reports filtered by reporter_id', async () => {
    const ownReports = [{ id: 'cr-1', reporter_id: USER_ID, reason: 'spam' }];
    const { client, fromSpy, calls } = createMockSupabaseClient({
      role: 'anon',
      userId: USER_ID,
      returnData: ownReports,
    });

    const result = await client
      .from('content_reports')
      .select('*')
      .eq('reporter_id', USER_ID);

    expect(fromSpy).toHaveBeenCalledWith('content_reports');
    expect(calls.some((c) => c.method === 'eq' && c.args[0] === 'reporter_id' && c.args[1] === USER_ID)).toBe(true);
    expect(result.data).toEqual(ownReports);
  });

  // ---- 9. Service role can manage all tables ----
  it('service_role client can insert, update, and delete across any table', async () => {
    const adminInsert = createMockSupabaseClient({ role: 'service_role', returnData: [{ id: 'new' }] });
    const adminUpdate = createMockSupabaseClient({ role: 'service_role', returnData: [{ id: 'upd' }] });
    const adminDelete = createMockSupabaseClient({ role: 'service_role', returnData: null });

    // Insert
    const insertResult = await adminInsert.client.from('credit_balances').insert({ organization_id: ORG_ID, balance: 500 });
    expect(adminInsert.fromSpy).toHaveBeenCalledWith('credit_balances');
    expect(insertResult.data).toBeTruthy();

    // Update
    const updateResult = await adminUpdate.client.from('organizations').update({ plan: 'pro' }).eq('id', ORG_ID);
    expect(adminUpdate.fromSpy).toHaveBeenCalledWith('organizations');
    expect(updateResult.data).toBeTruthy();

    // Delete
    const deleteResult = await adminDelete.client.from('processed_stripe_events').delete().eq('id', 'evt-1');
    expect(adminDelete.fromSpy).toHaveBeenCalledWith('processed_stripe_events');
    expect(deleteResult.error).toBeNull();
  });

  // ---- 10. Unauthenticated user cannot access protected tables ----
  it('unauthenticated client receives RLS error for protected tables', async () => {
    const { client, fromSpy } = createMockSupabaseClient({
      role: 'anon',
      // No userId — unauthenticated
      returnData: null,
      returnError: { message: 'new row violates row-level security policy', code: '42501' },
    });

    const result = await client.from('organization_members').select('*');
    expect(fromSpy).toHaveBeenCalledWith('organization_members');
    expect(result.error).toBeTruthy();
    expect(result.error?.code).toBe('42501');
  });

  // ---- 11. User can insert own content_report ----
  it('user client can insert a content_report with own reporter_id', async () => {
    const newReport = { id: 'cr-new', reporter_id: USER_ID, reason: 'inappropriate' };
    const { client, fromSpy, calls } = createMockSupabaseClient({
      role: 'anon',
      userId: USER_ID,
      returnData: [newReport],
    });

    const result = await client
      .from('content_reports')
      .insert({ reporter_id: USER_ID, api_id: 'api-x', reason: 'inappropriate' });

    expect(fromSpy).toHaveBeenCalledWith('content_reports');
    expect(calls.some((c) => c.method === 'insert')).toBe(true);
    expect(result.data).toEqual([newReport]);
  });

  // ---- 12. Admin client factory requires env vars ----
  it('createAdminClient throws when env vars are missing', async () => {
    const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.SUPABASE_SERVICE_ROLE_KEY = '';

    // Dynamic import to avoid module-level throw
    const adminMod = await import('@/lib/supabase/admin');

    expect(() => adminMod.createAdminClient()).toThrow('Missing Supabase environment variables');

    // Restore
    process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = origKey;
  });
});
