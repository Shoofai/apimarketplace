import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  signupSchema,
  createApiSchema,
  updateOrganizationSchema,
  createOrganizationSchema,
} from '@/lib/validations/index';

// ---------------------------------------------------------------------------
// Login Schema
// ---------------------------------------------------------------------------
describe('Validation — loginSchema', () => {
  it('accepts valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Signup Schema
// ---------------------------------------------------------------------------
describe('Validation — signupSchema', () => {
  const validSignup = {
    email: 'new@user.com',
    password: 'StrongP1ss',
    full_name: 'Jane Doe',
    organization_name: 'Acme Corp',
  };

  it('accepts valid signup data', () => {
    const result = signupSchema.safeParse(validSignup);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = signupSchema.safeParse({ email: 'a@b.com' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = signupSchema.safeParse({ ...validSignup, email: 'bad' });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase letter', () => {
    const result = signupSchema.safeParse({ ...validSignup, password: 'alllower1' });
    expect(result.success).toBe(false);
  });

  it('rejects password without a number', () => {
    const result = signupSchema.safeParse({ ...validSignup, password: 'NoNumbers' });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = signupSchema.safeParse({ ...validSignup, password: 'Ab1' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Create API Schema
// ---------------------------------------------------------------------------
describe('Validation — createApiSchema', () => {
  const validApi = {
    name: 'Weather API',
    slug: 'weather-api',
    description: 'Provides real-time weather data worldwide',
    base_url: 'https://api.weather.io',
  };

  it('accepts valid API publish data', () => {
    const result = createApiSchema.safeParse(validApi);
    expect(result.success).toBe(true);
  });

  it('requires name and slug', () => {
    const result = createApiSchema.safeParse({ description: 'Something short enough nope', base_url: 'https://x.io' });
    expect(result.success).toBe(false);
  });

  it('rejects slug with uppercase or spaces', () => {
    const result = createApiSchema.safeParse({ ...validApi, slug: 'Bad Slug' });
    expect(result.success).toBe(false);
  });

  it('rejects description shorter than 10 characters', () => {
    const result = createApiSchema.safeParse({ ...validApi, description: 'Too short' });
    expect(result.success).toBe(false);
  });

  it('allows optional tags array', () => {
    const result = createApiSchema.safeParse({ ...validApi, tags: ['weather', 'geo'] });
    expect(result.success).toBe(true);
  });

  it('rejects more than 10 tags', () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    const result = createApiSchema.safeParse({ ...validApi, tags });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Organization Update Schema
// ---------------------------------------------------------------------------
describe('Validation — updateOrganizationSchema', () => {
  it('accepts partial update with valid name', () => {
    const result = updateOrganizationSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 2 characters', () => {
    const result = updateOrganizationSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    const result = updateOrganizationSchema.safeParse({ name: 'X'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('allows empty string for optional URL fields', () => {
    const result = updateOrganizationSchema.safeParse({ website: '', logo_url: '' });
    expect(result.success).toBe(true);
  });

  it('rejects malformed website URL', () => {
    const result = updateOrganizationSchema.safeParse({ website: 'not-a-url' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Create Organization Schema
// ---------------------------------------------------------------------------
describe('Validation — createOrganizationSchema', () => {
  it('accepts a complete valid organization', () => {
    const result = createOrganizationSchema.safeParse({
      name: 'Acme Corp',
      slug: 'acme-corp',
      type: 'provider',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing type field', () => {
    const result = createOrganizationSchema.safeParse({
      name: 'Acme',
      slug: 'acme',
    });
    expect(result.success).toBe(false);
  });
});
