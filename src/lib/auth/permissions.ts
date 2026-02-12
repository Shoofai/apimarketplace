import type { UserRole } from '@/lib/utils/constants';

/**
 * Permission definitions for the platform.
 * Maps permission keys to allowed roles.
 */
const PERMISSIONS = {
  // Organization management
  'org.manage': ['owner', 'admin'],
  'org.delete': ['owner'],
  'org.billing': ['owner', 'finance'],
  
  // Member management
  'members.invite': ['owner', 'admin'],
  'members.remove': ['owner', 'admin'],
  'members.view': ['owner', 'admin', 'developer', 'viewer', 'finance', 'support'],
  
  // API management
  'api.create': ['owner', 'admin', 'developer'],
  'api.publish': ['owner', 'admin'],
  'api.delete': ['owner', 'admin'],
  'api.view': ['owner', 'admin', 'developer', 'viewer', 'finance', 'support'],
  'api.edit': ['owner', 'admin', 'developer'],
  
  // Analytics
  'analytics.view': ['owner', 'admin', 'developer', 'viewer', 'finance'],
  'analytics.export': ['owner', 'admin', 'finance'],
  
  // Support
  'support.manage': ['owner', 'admin', 'support'],
  'support.view': ['owner', 'admin', 'support'],
  
  // Billing
  'billing.view': ['owner', 'finance'],
  'billing.manage': ['owner'],
  
  // Settings
  'settings.view': ['owner', 'admin', 'developer', 'finance'],
  'settings.manage': ['owner', 'admin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Checks if a role has a specific permission.
 * 
 * @param role - User's role in the organization
 * @param permission - Permission to check
 * @returns true if the role has the permission
 */
export function hasPermission(
  role: UserRole | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(role as any);
}

/**
 * Checks if a role has any of the specified permissions.
 * 
 * @param role - User's role in the organization
 * @param permissions - Array of permissions to check
 * @returns true if the role has at least one permission
 */
export function hasAnyPermission(
  role: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Checks if a role has all of the specified permissions.
 * 
 * @param role - User's role in the organization
 * @param permissions - Array of permissions to check
 * @returns true if the role has all permissions
 */
export function hasAllPermissions(
  role: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Gets all permissions for a given role.
 * 
 * @param role - User's role
 * @returns Array of permissions the role has
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return Object.keys(PERMISSIONS).filter((permission) =>
    hasPermission(role, permission as Permission)
  ) as Permission[];
}

/**
 * Permission descriptions for UI display.
 */
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  'org.manage': 'Manage organization settings and details',
  'org.delete': 'Delete the organization',
  'org.billing': 'View and manage billing information',
  'members.invite': 'Invite new members to the organization',
  'members.remove': 'Remove members from the organization',
  'members.view': 'View organization members',
  'api.create': 'Create new APIs',
  'api.publish': 'Publish APIs to the marketplace',
  'api.delete': 'Delete APIs',
  'api.view': 'View APIs and their details',
  'api.edit': 'Edit API configurations',
  'analytics.view': 'View analytics and usage data',
  'analytics.export': 'Export analytics data',
  'support.manage': 'Manage support tickets and requests',
  'support.view': 'View support tickets',
  'billing.view': 'View billing information',
  'billing.manage': 'Manage payment methods and subscriptions',
  'settings.view': 'View organization settings',
  'settings.manage': 'Modify organization settings',
};

/**
 * Role descriptions for UI display.
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  owner: 'Full access to all features including billing and organization deletion',
  admin: 'Manage APIs, members, and settings (excluding billing)',
  developer: 'Create and manage APIs, view analytics',
  viewer: 'Read-only access to APIs and analytics',
  finance: 'Access to billing and cost management',
  support: 'Handle support tickets and developer issues',
};
