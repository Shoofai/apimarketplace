// Organization types
export const ORGANIZATION_TYPES = {
  PROVIDER: 'provider',
  CONSUMER: 'consumer',
  ENTERPRISE: 'enterprise',
  BOTH: 'both',
} as const;

export type OrganizationType = (typeof ORGANIZATION_TYPES)[keyof typeof ORGANIZATION_TYPES];

// User roles within organizations
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  DEVELOPER: 'developer',
  VIEWER: 'viewer',
  FINANCE: 'finance',
  SUPPORT: 'support',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// API statuses
export const API_STATUSES = {
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  PUBLISHED: 'published',
  DEPRECATED: 'deprecated',
  SUSPENDED: 'suspended',
  UNCLAIMED: 'unclaimed',
  CLAIM_PENDING: 'claim_pending',
} as const;

export type ApiStatus = (typeof API_STATUSES)[keyof typeof API_STATUSES];

// API visibility
export const API_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  UNLISTED: 'unlisted',
} as const;

export type ApiVisibility = (typeof API_VISIBILITY)[keyof typeof API_VISIBILITY];

// Subscription statuses
export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[keyof typeof SUBSCRIPTION_STATUSES];

// Invitation statuses
export const INVITATION_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
} as const;

export type InvitationStatus = (typeof INVITATION_STATUSES)[keyof typeof INVITATION_STATUSES];

// Plan limits
export const PLAN_LIMITS = {
  free: {
    apis: 1,
    calls_per_month: 1000,
    team_members: 3,
    rate_limit_per_second: 1,
  },
  starter: {
    apis: 5,
    calls_per_month: 50000,
    team_members: 10,
    rate_limit_per_second: 10,
  },
  pro: {
    apis: 25,
    calls_per_month: 500000,
    team_members: 50,
    rate_limit_per_second: 100,
  },
  enterprise: {
    apis: Infinity,
    calls_per_month: Infinity,
    team_members: Infinity,
    rate_limit_per_second: 1000,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

// API Key scopes
export const API_KEY_SCOPES = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin',
} as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[keyof typeof API_KEY_SCOPES];

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

// Sprint statuses
export const SPRINT_STATUSES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
  SKIPPED: 'skipped',
} as const;

export type SprintStatus = (typeof SPRINT_STATUSES)[keyof typeof SPRINT_STATUSES];

// Task categories
export const TASK_CATEGORIES = {
  DATABASE: 'database',
  BACKEND: 'backend',
  FRONTEND: 'frontend',
  TESTING: 'testing',
  DEVOPS: 'devops',
  DOCUMENTATION: 'documentation',
} as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[keyof typeof TASK_CATEGORIES];

// Default pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/** Default limit for list queries (no cursor/offset yet). Bounds unbounded selects. */
export const DEFAULT_LIST_LIMIT = 50;

// Rate limiting defaults
export const RATE_LIMITS = {
  API_ROUTE_DEFAULT: 100, // requests per minute
  API_KEY_FREE: 100, // requests per minute
  API_KEY_PRO: 1000, // requests per minute
  API_KEY_ENTERPRISE: -1, // unlimited
} as const;

// Invitation expiry
export const INVITATION_EXPIRY_DAYS = 7;

// API Key formats
export const API_KEY_PREFIX = {
  LIVE: 'amp_live_',
  TEST: 'amp_test_',
} as const;

// Supported OpenAPI versions
export const OPENAPI_VERSIONS = ['2.0', '3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0'] as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_LOGO_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_OPENAPI_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_SPEC_TYPES: ['application/json', 'application/x-yaml', 'text/yaml', 'text/plain'],
} as const;

// Audit log actions
export const AUDIT_ACTIONS = {
  // Organization actions
  ORG_CREATED: 'org.created',
  ORG_UPDATED: 'org.updated',
  ORG_DELETED: 'org.deleted',
  
  // Member actions
  MEMBER_INVITED: 'member.invited',
  MEMBER_JOINED: 'member.joined',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',
  
  // API actions
  API_CREATED: 'api.created',
  API_UPDATED: 'api.updated',
  API_DELETED: 'api.deleted',
  API_PUBLISHED: 'api.published',
  API_DEPRECATED: 'api.deprecated',
  API_SUSPENDED: 'api.suspended',
  API_CLAIM_REQUESTED: 'api.claim_requested',
  
  // Subscription actions
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  
  // API Key actions
  API_KEY_CREATED: 'api_key.created',
  API_KEY_REVOKED: 'api_key.revoked',
  API_KEY_ROTATED: 'api_key.rotated',
  
  // Auth actions
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',
  PASSWORD_RESET: 'password.reset',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
