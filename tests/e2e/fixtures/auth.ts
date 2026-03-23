/**
 * Test credentials for E2E tests.
 *
 * Uses environment variables when available, otherwise falls back to the
 * seeded test users created by supabase/migrations/20260213_create_test_users.sql.
 *
 * All seeded users share the password: TestPass123!
 */

export const TEST_USER_EMAIL =
  process.env.TEST_USER_EMAIL || 'developer.free@startup.com';

export const TEST_USER_PASSWORD =
  process.env.TEST_USER_PASSWORD || 'TestPass123!';

export const TEST_ADMIN_EMAIL =
  process.env.TEST_ADMIN_EMAIL || 'admin@apimarketplace.pro';

export const TEST_ADMIN_PASSWORD =
  process.env.TEST_ADMIN_PASSWORD || 'TestPass123!';
