'use client';

import { useOrganization } from '@/hooks/useOrganization';
import { hasPermission, type Permission } from '@/lib/auth/permissions';

interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions.
 * Only renders children if the user has the required permission.
 * 
 * @example
 * <PermissionGate permission="api.create">
 *   <CreateAPIButton />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { role, loading } = useOrganization();

  if (loading) {
    return null;
  }

  if (!role || !hasPermission(role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AnyPermissionGateProps {
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that renders children if user has ANY of the specified permissions.
 */
export function AnyPermissionGate({
  permissions,
  children,
  fallback = null,
}: AnyPermissionGateProps) {
  const { role, loading } = useOrganization();

  if (loading) {
    return null;
  }

  const hasAny = permissions.some((permission) => hasPermission(role, permission));

  if (!hasAny) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AllPermissionsGateProps {
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that renders children if user has ALL of the specified permissions.
 */
export function AllPermissionsGate({
  permissions,
  children,
  fallback = null,
}: AllPermissionsGateProps) {
  const { role, loading } = useOrganization();

  if (loading) {
    return null;
  }

  const hasAll = permissions.every((permission) => hasPermission(role, permission));

  if (!hasAll) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
