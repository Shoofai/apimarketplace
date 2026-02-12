import { createClient } from '@/lib/supabase/server';
import { AuthError, ForbiddenError } from '@/lib/utils/errors';
import { hasPermission, type Permission } from './permissions';
import type { UserRole } from '@/lib/utils/constants';

export interface AuthContext {
  user: {
    id: string;
    email: string;
  };
  organization_id: string;
  role: UserRole;
}

/**
 * Requires authentication and returns user context.
 * Throws AuthError if user is not authenticated.
 * 
 * @returns Authenticated user context with organization and role
 */
export async function requireAuth(): Promise<AuthContext> {
  const supabase = await createClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AuthError('Authentication required');
  }

  // Fetch user's current organization
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('current_organization_id')
    .eq('id', user.id)
    .single();

  if (userError || !userData?.current_organization_id) {
    throw new AuthError('No active organization');
  }

  // Fetch user's role in the organization
  const { data: member, error: memberError } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', userData.current_organization_id)
    .single();

  if (memberError || !member) {
    throw new AuthError('Not a member of the organization');
  }

  return {
    user: {
      id: user.id,
      email: user.email || '',
    },
    organization_id: userData.current_organization_id,
    role: member.role as UserRole,
  };
}

/**
 * Requires authentication and a specific permission.
 * Throws AuthError if not authenticated or ForbiddenError if lacking permission.
 * 
 * @param permission - Required permission
 * @returns Authenticated user context with organization and role
 */
export async function requirePermission(permission: Permission): Promise<AuthContext> {
  const context = await requireAuth();

  if (!hasPermission(context.role, permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }

  return context;
}

/**
 * Requires any of the specified permissions.
 * 
 * @param permissions - Array of acceptable permissions
 * @returns Authenticated user context with organization and role
 */
export async function requireAnyPermission(
  permissions: Permission[]
): Promise<AuthContext> {
  const context = await requireAuth();

  const hasAny = permissions.some((permission) =>
    hasPermission(context.role, permission)
  );

  if (!hasAny) {
    throw new ForbiddenError(`Missing required permissions: ${permissions.join(', ')}`);
  }

  return context;
}

/**
 * Optionally gets auth context without throwing if not authenticated.
 * Useful for public routes that want to show different content for authenticated users.
 * 
 * @returns Auth context or null if not authenticated
 */
export async function getOptionalAuth(): Promise<AuthContext | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}
