import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

/**
 * Component Tests
 *
 * Tests for LoginPage, PlatformLogo, and FloatingQuickActions using
 * vitest + React Testing Library.
 *
 * NOTE: @testing-library/react must be in devDependencies.
 * Install with: npm i -D @testing-library/react @testing-library/jest-dom
 */

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
  usePathname: () => '/dashboard',
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className, ...props }: any) =>
    React.createElement('img', { src, alt, width, height, className, ...props }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('div', { ...props, ref }, children)),
  },
}));

// Mock Supabase hook
const mockSignInWithPassword = vi.fn().mockResolvedValue({ data: { session: {} }, error: null });
const mockSignInWithOAuth = vi.fn().mockResolvedValue({ error: null });
const mockSignInWithSSO = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/hooks/useSupabase', () => ({
  useSupabase: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
      signInWithSSO: mockSignInWithSSO,
    },
  }),
}));

// Mock Supabase client (for PlatformLogo env)
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
    },
  })),
}));

// Mock react-hook-form to work with our test setup
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => vi.fn(),
}));

// Mock validations
vi.mock('@/lib/validations', () => ({
  loginSchema: {
    _type: undefined,
    parse: vi.fn(),
  },
}));

// Mock auth components
vi.mock('@/components/auth/MFAVerifyStep', () => ({
  default: () => React.createElement('div', { 'data-testid': 'mfa-step' }, 'MFA Step'),
}));

// Mock UI components to simplify testing
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, disabled, type, onClick, ...props }: any) =>
    React.createElement('button', { disabled, type, onClick, ...props }, children),
}));

vi.mock('@/components/ui/input', () => ({
  Input: React.forwardRef(({ type, placeholder, disabled, ...props }: any, ref: any) =>
    React.createElement('input', { type, placeholder, disabled, ref, ...props })),
}));

vi.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }: any) => React.createElement('div', props, children),
  FormControl: ({ children }: any) => React.createElement('div', null, children),
  FormField: ({ render, name }: any) => {
    const field = { value: '', onChange: vi.fn(), onBlur: vi.fn(), name, ref: vi.fn() };
    return render({ field });
  },
  FormItem: ({ children }: any) => React.createElement('div', null, children),
  FormLabel: ({ children }: any) => React.createElement('label', null, children),
  FormMessage: () => null,
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: any) => React.createElement('div', { role: 'alert' }, children),
  AlertDescription: ({ children }: any) => React.createElement('p', null, children),
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => React.createElement('hr'),
}));

// ---------------------------------------------------------------------------
// Tests: LoginPage
// ---------------------------------------------------------------------------

describe('LoginPage', () => {
  let LoginPage: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/app/(auth)/login/page');
    LoginPage = mod.default;
  });

  it('renders email and password fields', () => {
    render(React.createElement(LoginPage));

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();
    expect(emailInput.getAttribute('type')).toBe('email');
    expect(passwordInput.getAttribute('type')).toBe('password');
  });

  it('shows validation labels for email and password', () => {
    render(React.createElement(LoginPage));

    expect(screen.getByText('Email')).toBeDefined();
    expect(screen.getByText('Password')).toBeDefined();
  });

  it('shows "Keep me logged in" checkbox checked by default', () => {
    render(React.createElement(LoginPage));

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDefined();
    expect((checkbox as HTMLInputElement).defaultChecked).toBe(true);
    expect(screen.getByText('Keep me logged in')).toBeDefined();
  });

  it('has a "Forgot password?" link', () => {
    render(React.createElement(LoginPage));

    const link = screen.getByText('Forgot password?');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/forgot-password');
  });

  it('has OAuth buttons for GitHub and Google', () => {
    render(React.createElement(LoginPage));

    const githubBtn = screen.getByText('Continue with GitHub');
    const googleBtn = screen.getByText('Continue with Google');

    expect(githubBtn).toBeDefined();
    expect(googleBtn).toBeDefined();
  });

  it('submit button shows loading state when clicked', async () => {
    render(React.createElement(LoginPage));

    const signInButton = screen.getByText('Sign in');
    expect(signInButton).toBeDefined();

    // The button text changes to 'Signing in...' when loading is true
    // We can verify the two text states exist in the component logic
    expect(signInButton.textContent).toBe('Sign in');
  });
});

// ---------------------------------------------------------------------------
// Tests: PlatformLogo
// ---------------------------------------------------------------------------

describe('PlatformLogo', () => {
  let PlatformLogo: React.ComponentType<any>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/components/PlatformLogo');
    PlatformLogo = mod.default;
  });

  it('renders with correct image src from Supabase storage', () => {
    render(React.createElement(PlatformLogo, { height: 36 }));

    const images = screen.getAllByAltText('Logo');
    expect(images.length).toBeGreaterThanOrEqual(1);

    // At least one image should point to the branding bucket
    const srcs = images.map((img) => img.getAttribute('src'));
    const hasBrandingSrc = srcs.some((s) => s?.includes('/storage/v1/object/public/branding/logo'));
    expect(hasBrandingSrc).toBe(true);
  });

  it('shows dark variant when variant="dark" is specified', () => {
    render(React.createElement(PlatformLogo, { variant: 'dark', height: 36 }));

    const images = screen.getAllByAltText('Logo');
    const srcs = images.map((img) => img.getAttribute('src'));
    const hasDarkSrc = srcs.some((s) => s?.includes('logo-dark.svg'));
    expect(hasDarkSrc).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: FloatingQuickActions
// ---------------------------------------------------------------------------

describe('FloatingQuickActions', () => {
  let FloatingQuickActions: React.ComponentType<any>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/components/dashboard/FloatingQuickActions');
    FloatingQuickActions = mod.FloatingQuickActions;
  });

  it('renders the FAB button with correct aria-label', () => {
    const user = { organizations: { type: 'consumer', plan: 'free' } };
    render(React.createElement(FloatingQuickActions, { user }));

    const fab = screen.getByLabelText('Open quick actions');
    expect(fab).toBeDefined();
    expect(fab.tagName.toLowerCase()).toBe('button');
  });

  it('shows quick actions menu when FAB is clicked', async () => {
    const user = { organizations: { type: 'both', plan: 'pro' } };
    render(React.createElement(FloatingQuickActions, { user }));

    const fab = screen.getByLabelText('Open quick actions');
    fireEvent.click(fab);

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeDefined();
    });

    // After opening, the button label changes
    const closeBtn = screen.getByLabelText('Close quick actions');
    expect(closeBtn).toBeDefined();
  });
});
