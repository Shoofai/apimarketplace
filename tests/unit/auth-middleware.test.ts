import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthError, ForbiddenError } from '@/lib/utils/errors';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  type Permission,
} from '@/lib/auth/permissions';
import { hasScope, type ApiKeyContext } from '@/lib/auth/api-key';

// ---------------------------------------------------------------------------
// Mock setup
// ---------------------------------------------------------------------------

// Build a chainable mock Supabase client that mirrors the real query builder.
function createMockSupabaseClient() {
  const chain: Record<string, any> = {};
  // Terminal methods return a promise-like with { data, error }
  let resolveValue: { data: any; error: any } = { data: null, error: null };

  const builder = {
    from: vi.fn(() => builder),
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    is: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(resolveValue)),
    update: vi.fn(() => builder),
    then: vi.fn((cb: any) => cb(resolveValue)),
    auth: {
      getUser: vi.fn(),
    },
    // Helper to set what the next chain resolves to
    _setResolve(data: any, error: any = null) {
      resolveValue = { data, error };
    },
  };

  return builder;
}

// We keep references so individual tests can override behaviour.
let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
  createClientWithToken: vi.fn(() => mockSupabase),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn(() => null), // no Authorization header by default
  })),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body: any, init: any) => ({ body, status: init?.status })),
  },
}));

// ---------------------------------------------------------------------------
// Import SUT *after* mocks are registered
// ---------------------------------------------------------------------------
const {
  requireAuth,
  requirePermission,
  requireAnyPermission,
  getOptionalAuth,
} = await import('@/lib/auth/middleware');

const { requirePlatformAdmin, withPlatformAdmin } = await import(
  '@/lib/auth/admin'
);

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

const TEST_USER = {
  id: 'user-123',
  email: 'dev@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '',
};

const TEST_ORG_ID = 'org-456';

/**
 * Configure the mock Supabase client to simulate a fully authenticated user
 * with the given role.
 */
function setupAuthenticatedUser(
  role: string,
  opts?: { orgId?: string; noOrg?: boolean; noMember?: boolean }
) {
  const orgId = opts?.orgId ?? TEST_ORG_ID;

  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: TEST_USER },
    error: null,
  });

  // We need to track sequential `.from()` calls to return different data for
  // 'users' vs 'organization_members' queries.
  let fromCallCount = 0;
  mockSupabase.from.mockImplementation((table: string) => {
    fromCallCount++;
    return mockSupabase;
  });

  // The first `.single()` call fetches user data (current_organization_id).
  // The second `.single()` call fetches org membership (role).
  let singleCallCount = 0;
  mockSupabase.single.mockImplementation(() => {
    singleCallCount++;
    if (singleCallCount === 1) {
      if (opts?.noOrg) {
        return Promise.resolve({ data: null, error: { message: 'not found' } });
      }
      return Promise.resolve({
        data: { current_organization_id: orgId },
        error: null,
      });
    }
    if (opts?.noMember) {
      return Promise.resolve({ data: null, error: { message: 'not found' } });
    }
    return Promise.resolve({ data: { role }, error: null });
  });
}

function setupUnauthenticatedUser() {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: { message: 'not authenticated' },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabase = createMockSupabaseClient();
});

// ===== 1. requireAuth() ==================================================

describe('requireAuth', () => {
  it('returns user context when a valid session exists', async () => {
    setupAuthenticatedUser('developer');

    const ctx = await requireAuth();

    expect(ctx.user.id).toBe(TEST_USER.id);
    expect(ctx.user.email).toBe(TEST_USER.email);
    expect(ctx.organization_id).toBe(TEST_ORG_ID);
    expect(ctx.role).toBe('developer');
  });

  it('throws AuthError when no session / user is null', async () => {
    setupUnauthenticatedUser();

    await expect(requireAuth()).rejects.toThrow(AuthError);
    await expect(requireAuth()).rejects.toThrow('Authentication required');
  });

  it('throws AuthError when user has no active organization', async () => {
    setupAuthenticatedUser('owner', { noOrg: true });

    await expect(requireAuth()).rejects.toThrow(AuthError);
    await expect(requireAuth()).rejects.toThrow('No active organization');
  });

  it('throws AuthError when user is not a member of the organization', async () => {
    setupAuthenticatedUser('admin', { noMember: true });

    await expect(requireAuth()).rejects.toThrow(AuthError);
    await expect(requireAuth()).rejects.toThrow('Not a member of the organization');
  });

  it('returns correct organization_id from user data', async () => {
    const customOrgId = 'org-custom-789';
    setupAuthenticatedUser('viewer', { orgId: customOrgId });

    const ctx = await requireAuth();
    expect(ctx.organization_id).toBe(customOrgId);
  });
});

// ===== 2. requirePermission() ============================================

describe('requirePermission', () => {
  it('returns context when user has the required permission', async () => {
    setupAuthenticatedUser('owner');

    const ctx = await requirePermission('org.manage');
    expect(ctx.role).toBe('owner');
  });

  it('throws ForbiddenError when user lacks the required permission', async () => {
    setupAuthenticatedUser('viewer');

    await expect(requirePermission('api.create')).rejects.toThrow(ForbiddenError);
    await expect(requirePermission('api.create')).rejects.toThrow(
      'Missing required permission: api.create'
    );
  });

  it('throws AuthError when there is no session', async () => {
    setupUnauthenticatedUser();

    await expect(requirePermission('api.view')).rejects.toThrow(AuthError);
  });
});

// ===== 3. requireAnyPermission() =========================================

describe('requireAnyPermission', () => {
  it('succeeds if the user has at least one of the listed permissions', async () => {
    // developer can api.create but not api.publish
    setupAuthenticatedUser('developer');

    const ctx = await requireAnyPermission(['api.publish', 'api.create']);
    expect(ctx.role).toBe('developer');
  });

  it('throws ForbiddenError when user has none of the listed permissions', async () => {
    setupAuthenticatedUser('viewer');

    await expect(
      requireAnyPermission(['api.create', 'api.publish'])
    ).rejects.toThrow(ForbiddenError);
  });
});

// ===== 4. getOptionalAuth() ==============================================

describe('getOptionalAuth', () => {
  it('returns auth context for authenticated users', async () => {
    setupAuthenticatedUser('admin');

    const ctx = await getOptionalAuth();
    expect(ctx).not.toBeNull();
    expect(ctx!.user.id).toBe(TEST_USER.id);
  });

  it('returns null for unauthenticated users instead of throwing', async () => {
    setupUnauthenticatedUser();

    const ctx = await getOptionalAuth();
    expect(ctx).toBeNull();
  });
});

// ===== 5. requirePlatformAdmin() =========================================

describe('requirePlatformAdmin', () => {
  it('returns user and userData when user is platform admin', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: TEST_USER },
      error: null,
    });

    let singleCallCount = 0;
    mockSupabase.single.mockImplementation(() => {
      singleCallCount++;
      return Promise.resolve({
        data: { is_platform_admin: true },
        error: null,
      });
    });

    const result = await requirePlatformAdmin();
    expect(result.user.id).toBe(TEST_USER.id);
    expect(result.userData.is_platform_admin).toBe(true);
  });

  it('throws when user is not platform admin', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: TEST_USER },
      error: null,
    });
    mockSupabase.single.mockResolvedValue({
      data: { is_platform_admin: false },
      error: null,
    });

    await expect(requirePlatformAdmin()).rejects.toThrow(
      'Forbidden: Platform admin access required'
    );
  });

  it('throws when no session exists', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(requirePlatformAdmin()).rejects.toThrow('Unauthorized');
  });
});

// ===== 6. withPlatformAdmin() wrapper ====================================

describe('withPlatformAdmin', () => {
  it('calls the handler when user is platform admin', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: TEST_USER },
      error: null,
    });
    mockSupabase.single.mockResolvedValue({
      data: { is_platform_admin: true },
      error: null,
    });

    const handler = vi.fn(async () => new Response('ok'));
    const wrapped = withPlatformAdmin(handler);

    await wrapped(new Request('http://localhost'), {});
    expect(handler).toHaveBeenCalled();
  });

  it('returns 401 when no session', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const handler = vi.fn();
    const wrapped = withPlatformAdmin(handler);

    const res = await wrapped(new Request('http://localhost'), {});
    expect(handler).not.toHaveBeenCalled();
    expect((res as any).status).toBe(401);
  });

  it('returns 403 when user is not admin', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: TEST_USER },
      error: null,
    });
    mockSupabase.single.mockResolvedValue({
      data: { is_platform_admin: false },
      error: null,
    });

    const handler = vi.fn();
    const wrapped = withPlatformAdmin(handler);

    const res = await wrapped(new Request('http://localhost'), {});
    expect(handler).not.toHaveBeenCalled();
    expect((res as any).status).toBe(403);
  });
});

// ===== 7. Permission checks (hasPermission / hasAnyPermission / etc) =====

describe('hasPermission', () => {
  it('returns true when role is in the allowed list', () => {
    expect(hasPermission('owner', 'org.manage')).toBe(true);
    expect(hasPermission('admin', 'org.manage')).toBe(true);
  });

  it('returns false when role is not in the allowed list', () => {
    expect(hasPermission('viewer', 'org.manage')).toBe(false);
    expect(hasPermission('developer', 'org.delete')).toBe(false);
  });

  it('returns false for null or undefined role', () => {
    expect(hasPermission(null, 'api.view')).toBe(false);
    expect(hasPermission(undefined, 'api.view')).toBe(false);
  });

  it('developer can create and edit APIs but not publish or delete', () => {
    expect(hasPermission('developer', 'api.create')).toBe(true);
    expect(hasPermission('developer', 'api.edit')).toBe(true);
    expect(hasPermission('developer', 'api.publish')).toBe(false);
    expect(hasPermission('developer', 'api.delete')).toBe(false);
  });

  it('finance role can access billing.view and org.billing', () => {
    expect(hasPermission('finance', 'billing.view')).toBe(true);
    expect(hasPermission('finance', 'org.billing')).toBe(true);
    expect(hasPermission('finance', 'billing.manage')).toBe(false);
  });

  it('support role has support permissions but not API management', () => {
    expect(hasPermission('support', 'support.manage')).toBe(true);
    expect(hasPermission('support', 'support.view')).toBe(true);
    expect(hasPermission('support', 'api.create')).toBe(false);
  });

  it('owner has access to all defined permissions', () => {
    const allPerms: Permission[] = [
      'org.manage', 'org.delete', 'org.billing',
      'members.invite', 'members.remove', 'members.view',
      'api.create', 'api.publish', 'api.delete', 'api.view', 'api.edit',
      'analytics.view', 'analytics.export',
      'support.manage', 'support.view',
      'billing.view', 'billing.manage',
      'settings.view', 'settings.manage',
    ];
    for (const perm of allPerms) {
      expect(hasPermission('owner', perm)).toBe(true);
    }
  });
});

describe('hasAnyPermission', () => {
  it('returns true if at least one permission matches', () => {
    expect(hasAnyPermission('viewer', ['api.create', 'api.view'])).toBe(true);
  });

  it('returns false if none match', () => {
    expect(hasAnyPermission('viewer', ['api.create', 'api.publish'])).toBe(false);
  });
});

describe('hasAllPermissions', () => {
  it('returns true only when all permissions match', () => {
    expect(hasAllPermissions('owner', ['org.manage', 'org.delete'])).toBe(true);
    expect(hasAllPermissions('admin', ['org.manage', 'org.delete'])).toBe(false);
  });
});

describe('getRolePermissions', () => {
  it('returns all permissions for the owner role', () => {
    const perms = getRolePermissions('owner');
    expect(perms).toContain('org.delete');
    expect(perms).toContain('billing.manage');
    expect(perms.length).toBeGreaterThan(10);
  });

  it('viewer has limited permissions', () => {
    const perms = getRolePermissions('viewer');
    expect(perms).toContain('api.view');
    expect(perms).toContain('members.view');
    expect(perms).not.toContain('api.create');
    expect(perms).not.toContain('org.manage');
  });
});

// ===== 8. API key scope checks ===========================================

describe('hasScope', () => {
  const baseContext: ApiKeyContext = {
    id: 'key-1',
    organization_id: 'org-1',
    user_id: 'user-1',
    scopes: ['read', 'write'],
  };

  it('returns true when scope is present', () => {
    expect(hasScope(baseContext, 'read')).toBe(true);
    expect(hasScope(baseContext, 'write')).toBe(true);
  });

  it('returns false when scope is absent', () => {
    expect(hasScope(baseContext, 'admin')).toBe(false);
    expect(hasScope(baseContext, 'delete')).toBe(false);
  });

  it('admin scope grants access to any scope', () => {
    const adminCtx: ApiKeyContext = { ...baseContext, scopes: ['admin'] };
    expect(hasScope(adminCtx, 'read')).toBe(true);
    expect(hasScope(adminCtx, 'write')).toBe(true);
    expect(hasScope(adminCtx, 'anything')).toBe(true);
  });
});
