import { z } from 'zod';

// Organization schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  type: z.enum(['provider', 'consumer', 'enterprise', 'both']),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().max(500).optional(),
  billing_email: z.string().email().optional().or(z.literal('')),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(500).optional(),
  billing_email: z.string().email().optional().or(z.literal('')),
  logo_url: z.string().url().optional().or(z.literal('')),
});

// User schemas
export const updateUserProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  preferences: z.record(z.any()).optional(),
});

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  full_name: z.string().min(2).max(100),
  organization_name: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// API registration schema
export const createApiSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(200),
  long_description: z.string().max(5000).optional(),
  base_url: z.string().url('Must be a valid URL'),
  category_id: z.string().uuid().optional().or(z.literal('')),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
});

export const updateApiSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(10).max(200).optional(),
  long_description: z.string().max(5000).optional(),
  base_url: z.string().url().optional(),
  category_id: z.string().uuid().optional().or(z.literal('')),
  tags: z.array(z.string()).max(10).optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  visibility: z.enum(['public', 'private', 'unlisted']).optional(),
});

// Pricing plan schema
export const createPricingPlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
  price_monthly: z.number().min(0, 'Price must be positive').max(999999),
  price_per_call: z.number().min(0).max(1, 'Price per call must be between 0 and 1'),
  included_calls: z.number().int().min(0, 'Must be a positive integer'),
  rate_limit_per_second: z.number().int().min(1).optional(),
  rate_limit_per_day: z.number().int().min(1).optional(),
  rate_limit_per_month: z.number().int().min(1).optional(),
  features: z.array(z.string()).optional(),
  is_custom: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});

export const updatePricingPlanSchema = createPricingPlanSchema.partial();

// Team invitation schema
export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'developer', 'viewer', 'finance', 'support']),
});

// API Key schema
export const createApiKeySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  scopes: z.array(z.enum(['read', 'write', 'admin'])).min(1, 'At least one scope is required'),
  expires_at: z.string().datetime().optional().or(z.literal('')),
});

// Provider profile schema
export const createProviderProfileSchema = z.object({
  display_name: z.string().min(2).max(100),
  tagline: z.string().max(120).optional(),
  long_description: z.string().max(5000).optional(),
  website: z.string().url().optional().or(z.literal('')),
  support_email: z.string().email().optional().or(z.literal('')),
  support_url: z.string().url().optional().or(z.literal('')),
  documentation_url: z.string().url().optional().or(z.literal('')),
  social_links: z.record(z.string().url()).optional(),
});

export const updateProviderProfileSchema = createProviderProfileSchema.partial();

// API Review schema
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().max(100).optional(),
  body: z.string().max(2000).optional(),
});

// Type exports for convenience
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateApiInput = z.infer<typeof createApiSchema>;
export type UpdateApiInput = z.infer<typeof updateApiSchema>;
export type CreatePricingPlanInput = z.infer<typeof createPricingPlanSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type CreateProviderProfileInput = z.infer<typeof createProviderProfileSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
