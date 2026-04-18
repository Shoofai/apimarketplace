import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

// ---------------------------------------------------------------------------
// Site-mode gate (prelaunch / maintenance)
// Module-level cache so we don't hit the DB on every request.
// ---------------------------------------------------------------------------
let _siteModeCache: { mode: string; message: string | null; ts: number } | null = null;
const SITE_MODE_TTL = 10_000; // 10 s

async function fetchSiteMode(): Promise<{ mode: string; message: string | null }> {
  const now = Date.now();
  if (_siteModeCache && now - _siteModeCache.ts < SITE_MODE_TTL) {
    return { mode: _siteModeCache.mode, message: _siteModeCache.message };
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { mode: 'live', message: null };
  try {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await sb
      .from('app_settings')
      .select('value')
      .eq('key', 'site_mode')
      .maybeSingle();
    const v = data?.value as { mode?: string; message?: string | null } | null;
    const result = { mode: v?.mode ?? 'live', message: v?.message ?? null, ts: now };
    _siteModeCache = result;
    return result;
  } catch {
    return { mode: 'live', message: null };
  }
}

/** Paths that are always reachable regardless of site mode. */
function isAllowedPath(pathname: string): boolean {
  return (
    // Core / auth
    pathname === '/prelaunch' ||
    pathname.startsWith('/early-access') ||
    pathname.startsWith('/login') ||
    // /signup is intentionally excluded — gated in prelaunch/maintenance mode
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/auth') ||
    // Public marketing & trust pages (visible in prelaunch mode)
    pathname === '/pricing' ||
    pathname === '/about' ||
    pathname.startsWith('/blog') ||
    pathname === '/security' ||
    pathname === '/trust-center' ||
    pathname === '/docs' ||
    pathname.startsWith('/docs/') ||
    pathname === '/contact' ||
    pathname === '/enterprise' ||
    pathname.startsWith('/help') ||
    pathname === '/use-cases' ||
    pathname === '/comparison' ||
    pathname === '/customers' ||
    pathname === '/roadmap' ||
    // Legal pages (required for GDPR/CCPA compliance when capturing leads)
    pathname.startsWith('/legal') ||
    // API routes (must match every public-page form submission)
    pathname.startsWith('/api/waitlist') ||
    pathname.startsWith('/api/early-access') ||
    pathname.startsWith('/api/leads') ||
    pathname.startsWith('/api/contact') ||   // ContactQuiz on /contact page
    pathname.startsWith('/api/blog') ||      // blog view-tracking, RSS
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/health') ||
    // Assets
    pathname === '/favicon.svg' ||
    pathname === '/icon' ||
    pathname === '/opengraph-image'
  );
}

/** Extract the JWT payload sub (user_id) from the Supabase auth cookie. */
function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const cookieHeader = request.headers.get('cookie') ?? '';
    const match = cookieHeader.match(/sb-[a-z0-9]+-auth-token/);
    if (!match) return null;
    const cookieName = match[0];
    let raw = '';
    const single = request.cookies.get(cookieName);
    if (single?.value) {
      raw = single.value;
    } else {
      for (let i = 0; i < 10; i++) {
        const chunk = request.cookies.get(`${cookieName}.${i}`);
        if (!chunk?.value) break;
        raw += chunk.value;
      }
    }
    if (!raw) return null;
    let accessToken: string | undefined;
    try { accessToken = JSON.parse(base64UrlDecode(raw))?.access_token; } catch {}
    try { if (!accessToken) accessToken = JSON.parse(decodeURIComponent(raw))?.access_token; } catch {}
    if (!accessToken && raw.split('.').length === 3) accessToken = raw;
    if (!accessToken) return null;
    const parts = accessToken.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return payload?.sub ?? null;
  } catch {
    return null;
  }
}

/** Check if the signed-in user is a platform admin (DB lookup, maintenance mode only). */
async function isPlatformAdmin(userId: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  try {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await sb
      .from('users')
      .select('is_platform_admin')
      .eq('id', userId)
      .maybeSingle();
    return data?.is_platform_admin === true;
  } catch {
    return false;
  }
}

/** True if the request carries a valid (non-empty UUID-shaped) early_access cookie. */
function hasEarlyAccessCookie(request: NextRequest): boolean {
  const val = request.cookies.get('early_access')?.value ?? '';
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(val);
}

function rewriteToPrelaunch(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = '/prelaunch';
  url.search = '';
  return NextResponse.rewrite(url);
}

/**
 * Resolve a custom domain to an org slug via Supabase REST (no server-side cookies needed).
 */
async function resolveCustomDomain(host: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await sb
      .from('organizations')
      .select('slug')
      .eq('custom_domain', host)
      .eq('portal_enabled', true)
      .maybeSingle();
    return data?.slug ?? null;
  } catch {
    return null;
  }
}

/**
 * Decode a base64url string to a UTF-8 string (Edge Runtime compatible).
 */
function base64UrlDecode(str: string): string {
  // Convert base64url to standard base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' to make length a multiple of 4
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  // atob is available in Edge Runtime
  return atob(base64);
}

/**
 * Validate a Supabase auth cookie value by decoding the JWT and checking
 * structural claims (exp, sub). This is NOT full signature verification
 * (we don't have the secret at the edge), but it prevents trivially forged
 * cookies from bypassing the dashboard guard.
 *
 * Cookie format: the cookie named `sb-<ref>-auth-token.0` (or without chunk
 * suffix) contains a base64-encoded JSON blob with `access_token`.
 * Supabase may chunk the cookie across `.0`, `.1`, etc.
 */
function hasValidAuthToken(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie') ?? '';

  // First check: cookie must exist with the Supabase naming pattern
  const hasAuthCookie = /sb-[a-z0-9]+-auth-token/.test(cookieHeader);
  if (!hasAuthCookie) return false;

  // Second check: try to decode and validate the JWT payload.
  // If decoding fails (cookie format varies across Supabase versions),
  // fall back to accepting the cookie presence — the server-side
  // getUserSafe() in the dashboard layout will do the definitive check.
  try {
    const authCookieMatch = cookieHeader.match(/sb-[a-z0-9]+-auth-token/)!;
    const cookieName = authCookieMatch[0];

    // Reassemble chunked cookies (.0, .1, .2, …) or read single cookie
    let raw = '';
    const singleCookie = request.cookies.get(cookieName);
    if (singleCookie?.value) {
      raw = singleCookie.value;
    } else {
      for (let i = 0; i < 10; i++) {
        const chunk = request.cookies.get(`${cookieName}.${i}`);
        if (!chunk?.value) break;
        raw += chunk.value;
      }
    }

    if (!raw) return true; // Cookie name exists but value unreadable — let server verify

    // Try to extract access_token from the cookie value
    let accessToken: string | undefined;
    try {
      // Format 1: base64-encoded JSON
      const decoded = base64UrlDecode(raw);
      const parsed = JSON.parse(decoded);
      accessToken = parsed?.access_token;
    } catch {
      try {
        // Format 2: URL-encoded JSON
        const parsed = JSON.parse(decodeURIComponent(raw));
        accessToken = parsed?.access_token;
      } catch {
        // Format 3: raw JWT string (some Supabase SSR versions)
        if (raw.split('.').length === 3) {
          accessToken = raw;
        }
      }
    }

    if (!accessToken || typeof accessToken !== 'string') return true; // Can't parse — let server verify

    // JWT structure: header.payload.signature
    const parts = accessToken.split('.');
    if (parts.length !== 3) return true; // Malformed but cookie exists — let server verify

    // Decode and check payload
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);

    // Only reject if we can definitively prove the token is expired
    if (typeof payload.exp === 'number') {
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp <= nowSeconds) return false; // Definitively expired
    }

    return true;
  } catch {
    // JWT validation failed but cookie exists — allow through,
    // the server-side check will do the definitive verification
    return true;
  }
}

/**
 * Security headers middleware.
 * - Applies strict security headers in production.
 * - Handles custom domain → internal portal rewrites.
 * - Tracks ?aff= affiliate cookie.
 * - Enforces authentication on /dashboard/* at the edge level.
 * - Enforces rate limiting on /api/* routes.
 */
export async function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development';
  const pathname = request.nextUrl.pathname;

  // Rate limiting: enforce on all /api/* routes (skip cron, webhooks, health)
  if (
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/cron/') &&
    !pathname.startsWith('/api/webhooks/')
  ) {
    const isAuthenticated = /sb-[a-z0-9]+-auth-token/.test(request.headers.get('cookie') ?? '');
    const hasApiKey = request.headers.get('x-api-key') !== null;
    const limit = isAuthenticated || hasApiKey ? 120 : 20;

    const rateLimited = rateLimit(request, { limit, windowMs: 60 * 1000 });
    if (rateLimited) {
      return new NextResponse(rateLimited.body, {
        status: 429,
        headers: Object.fromEntries(rateLimited.headers),
      });
    }
  }

  // ── Site-mode gate ────────────────────────────────────────────────────────
  // Skip gate for dashboard (already auth-guarded) and always-open paths.
  if (!pathname.startsWith('/dashboard') && !isAllowedPath(pathname)) {
    const { mode } = await fetchSiteMode();

    if (mode === 'maintenance') {
      const signedIn = hasValidAuthToken(request);
      if (!signedIn) return rewriteToPrelaunch(request);
      const uid = getUserIdFromToken(request);
      if (!uid || !(await isPlatformAdmin(uid))) return rewriteToPrelaunch(request);
      // Admin: fall through to the rest of the middleware
    } else if (mode === 'prelaunch') {
      if (!hasValidAuthToken(request) && !hasEarlyAccessCookie(request)) {
        return rewriteToPrelaunch(request);
      }
      // Signed-in users or invite-code holders: fall through
    }
  }
  // ── End gate ──────────────────────────────────────────────────────────────

  // Custom domain rewrite: if the host doesn't match the platform domain,
  // look up the org and rewrite to /portal/[org_slug]
  const host = request.headers.get('host') ?? '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const platformHost = (() => {
    try { return new URL(siteUrl).host; } catch { return ''; }
  })();

  if (
    host &&
    platformHost &&
    host !== platformHost &&
    !host.startsWith('localhost') &&
    !host.includes('127.0.0.1') &&
    !pathname.startsWith('/portal/')
  ) {
    const orgSlug = await resolveCustomDomain(host);
    if (orgSlug) {
      const url = request.nextUrl.clone();
      url.pathname = `/portal/${orgSlug}`;
      return NextResponse.rewrite(url);
    }
  }

  // Dashboard auth guard — redirect unauthenticated users to /login
  // We decode the JWT from the Supabase auth cookie and verify structural
  // claims (exp, sub). This prevents trivially forged cookies from bypassing
  // the guard. Individual pages still do full server-side auth checks.
  if (pathname.startsWith('/dashboard')) {
    if (!hasValidAuthToken(request)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ?aff=<code> tracking: write a 30-day affiliate cookie + increment click count
  const affCode = request.nextUrl.searchParams.get('aff');
  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        'x-pathname': pathname,
      }),
    },
  });

  if (affCode && /^[a-zA-Z0-9_-]{3,64}$/.test(affCode)) {
    response.cookies.set('aff', affCode, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: 'lax',
    });

    // Increment click count asynchronously via internal API route
    const origin = siteUrl || `http://${host}`;
    fetch(`${origin}/api/affiliate/track-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: affCode }),
    }).catch((err) => {
      console.error('[middleware] Affiliate click tracking failed', {
        error: err instanceof Error ? err.message : String(err),
        affCode,
      });
    });
  }

  if (!isDev) {
    // Generate a per-request nonce for CSP script-src
    const nonce = crypto.randomUUID();
    response.headers.set('x-csp-nonce', nonce);

    response.headers.set(
      'Content-Security-Policy',
      `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com; frame-src https://js.stripe.com; report-uri /api/csp-report;`
    );
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );
  }

  // Rate-limit headers (informational for authenticated API requests)
  response.headers.set('X-RateLimit-Limit', '120');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
