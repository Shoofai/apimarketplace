import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthError, ForbiddenError } from '@/lib/utils/errors';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  type Permission,
} from '@/lib/auth/permissions';

// ---------------------------------------------------------------------------
// Mock setup for Supabase
// ---------------------------------------------------------------------------

let mockUser: any = null;
let mockUserData: any = null;
let mockMemberData: any = null;

const mockSupabase = {
  auth: {
    getUser: vi.fn(() =>
      Promise.resolve({
        data: { user: mockUser },
        error: mockUser ? null : { message: 'No session' },
      })
    ),
  },
  from: vi.fn((table: string) => {
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      single: vi.fn(() => {
        if (table === 'users') {
          return Promise.resolve({
            data: mockUserData,
            error: mockUserData ? null : { message: 'Not found' },
          });
        }
        if (table === 'organization_members') {
          return Promise.resolve({
            data: mockMemberData,
            error: mockMemberData ? null : { message: 'Not found' },
          });
        }
        return Promise.resolve({ data: null, error: null });
      }),
    };
    return chain;
  }),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
  createClientWithToken: vi.fn(() => mockSupabase),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Map())),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({ body, status: init?.status || 200 }),
  },
}));

// ---------------------------------------------------------------------------
// Import modules (mocks are already applied via vi.mock above)
// ---------------------------------------------------------------------------
import { requireAuth, requirePermission, requireAnyPermission, getOptionalAuth } from '@/lib/auth/middleware';
import { requirePlatformAdmin, withPlatformAdmin } from '@/lib/auth/admin';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('requireAuth', () => {
  beforeEach(() => {
    mockUser = null;
    mockUserData = null;
    mockMemberData = null;
  });

  it('returns user context when valid session exists', async () => {
    mockUser = { id: 'user-1', email: 'test@lukeapi.com' };
    mockUserData = { current_organization_id: 'org-1' };
    mockMemberData = { role: 'owner' };

    const ctx = await requireAuth();
    expect(ctx.user.id).toBe('user-1');
    expect(ctx.user.email).toBe('test@lukeapi.com');
    expect(ctx.organization_id).toBe('org-1');
    expect(ctx.role).toBe('owner');
  });

  it('throws AuthError when no session', async () => {
    mockUser = null;
    await expect(requireAuth()).rejects.toThrow(AuthError);
  });

  it('throws AuthError when user has no organization', async () => {
    mockUser = { id: 'user-1', email: 'test@lukeapi.com' };
    mockUserData = null;
    await expect(requireAuth()).rejects.toThrow(AuthError);
  });

  it('throws AuthError when not a member of organization', async () => {
    mockUser = { id: 'user-1', email: 'test@lukeapi.com' };
    mockUserData = { current_organization_id: 'org-1' };
    mockMemberData = null;
    await expect(requireAuth()).rejects.toThrow(AuthError);
  });
});

describe('requirePermission', () => {
  beforeEach(() => {
    mockUser = null;
    mockUserData = null;
    mockMemberData = null;
  });

  it('returns context when user has permission', async () => {
    mockUser = { id: 'user-1', email: 'admin@lukeapi.com' };
    mockUserData = { current_organization_id: 'org-1' };
    mockMemberData = { role: 'owner' };

    const ctx = await requirePermission('api.create');
    expect(ctx.role).toBe('owner');
  });

  it('throws ForbiddenError when lacking permission', async () => {
    mockUser = { id: 'user-1', email: 'viewer@lukeapi.com' };
    mockUserData = { current_organization_id: 'org-1' };
    mockMemberData = { role: 'viewer' };

    await expect(requirePermission('api.create')).rejects.toThrow(ForbiddenError);
  });

  it('throws AuthError when unauthenticated', async () => {
    mockUser = null;
    await expect(requirePermission('api.view')).rejects.toThrow(AuthError);
  });
});

describe('getOptionalAuth', () => {
  beforeEach(() => {
    mockUser = null;
    mockUserData = null;
    mockMemberData = null;
  });

  it('returns context for authenticated users', async () => {
    mockUser = { id: 'user-1', email: 'test@lukeapi.com' };
    mockUserData = { current_organization_id: 'org-1' };
    mockMemberData = { role: 'developer' };

    const ctx = await getOptionalAuth();
    expect(ctx).not.toBeNull();
    expect(ctx?.user.id).toBe('user-1');
  });

  it('returns null for unauthenticated users', async () => {
    mockUser = null;
    const ctx = await getOptionalAuth();
    expect(ctx).toBeNull();
  });
});

describe('requirePlatformAdmin', () => {
  beforeEach(() => {
    mockUser = null;
    mockUserData = null;
    mockMemberData = null;
  });

  it('returns user when is platform admin', async () => {
    mockUser = { id: 'admin-1', email: 'admin@lukeapi.com' };
    mockUserData = { is_platform_admin: true };

    const result = await requirePlatformAdmin();
    expect(result.user.id).toBe('admin-1');
  });

  it('throws when user is not admin', async () => {
    mockUser = { id: 'user-1', email: 'user@lukeapi.com' };
    mockUserData = { is_platform_admin: false };

    await expect(requirePlatformAdmin()).rejects.toThrow('Forbidden');
  });

  it('throws when no session', async () => {
    mockUser = null;
    await expect(requirePlatformAdmin()).rejects.toThrow('Unauthorized');
  });
});

describe('withPlatformAdmin', () => {
  beforeEach(() => {
    mockUser = null;
    mockUserData = null;
    mockMemberData = null;
  });

  it('calls handler when user is admin', async () => {
    mockUser = { id: 'admin-1', email: 'admin@lukeapi.com' };
    mockUserData = { is_platform_admin: true };

    const handler = vi.fn(() => Promise.resolve(new Response('ok')));
    const wrapped = withPlatformAdmin(handler);
    await wrapped(new Request('http://localhost'), {});
    expect(handler).toHaveBeenCalled();
  });

  it('returns 401 when no session', async () => {
    mockUser = null;
    const handler = vi.fn();
    const wrapped = withPlatformAdmin(handler);
    const res = await wrapped(new Request('http://localhost'), {});
    expect(handler).not.toHaveBeenCalled();
    expect((res as any).status).toBe(401);
  });

  it('returns 403 when not admin', async () => {
    mockUser = { id: 'user-1', email: 'user@lukeapi.com' };
    mockUserData = { is_platform_admin: false };

    const handler = vi.fn();
    const wrapped = withPlatformAdmin(handler);
    const res = await wrapped(new Request('http://localhost'), {});
    expect(handler).not.toHaveBeenCalled();
    expect((res as any).status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// Pure function tests (no mocks needed)
// ---------------------------------------------------------------------------

describe('hasPermission', () => {
  it('owner has org.manage', () => {
    expect(hasPermission('owner', 'org.manage')).toBe(true);
  });

  it('viewer cannot manage org', () => {
    expect(hasPermission('viewer', 'org.manage')).toBe(false);
  });

  it('developer can create APIs', () => {
    expect(hasPermission('developer', 'api.create')).toBe(true);
  });

  it('developer cannot publish APIs', () => {
    expect(hasPermission('developer', 'api.publish')).toBe(false);
  });

  it('finance can view billing', () => {
    expect(hasPermission('finance', 'billing.view')).toBe(true);
  });

  it('support can manage support', () => {
    expect(hasPermission('support', 'support.manage')).toBe(true);
  });

  it('null role returns false', () => {
    expect(hasPermission(null, 'api.view')).toBe(false);
  });
});

describe('hasAnyPermission', () => {
  it('returns true when at least one matches', () => {
    expect(hasAnyPermission('developer', ['api.publish', 'api.create'])).toBe(true);
  });

  it('returns false when none match', () => {
    expect(hasAnyPermission('viewer', ['api.create', 'api.publish'])).toBe(false);
  });
});

describe('hasAllPermissions', () => {
  it('returns true when all match', () => {
    expect(hasAllPermissions('owner', ['api.create', 'api.publish', 'api.delete'])).toBe(true);
  });

  it('returns false when not all match', () => {
    expect(hasAllPermissions('developer', ['api.create', 'api.publish'])).toBe(false);
  });
});

describe('getRolePermissions', () => {
  it('owner has many permissions', () => {
    const perms = getRolePermissions('owner');
    expect(perms.length).toBeGreaterThan(10);
    expect(perms).toContain('org.delete');
    expect(perms).toContain('billing.manage');
  });

  it('viewer has limited permissions', () => {
    const perms = getRolePermissions('viewer');
    expect(perms.length).toBeLessThan(5);
    expect(perms).toContain('api.view');
    expect(perms).not.toContain('api.create');
  });
});
