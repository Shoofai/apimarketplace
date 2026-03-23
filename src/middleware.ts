import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

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
  try {
    // Collect the cookie value — Supabase may split it into numbered chunks
    const cookieHeader = request.headers.get('cookie') ?? '';
    const authCookieMatch = cookieHeader.match(/sb-[a-z0-9]+-auth-token/);
    if (!authCookieMatch) return false;

    const cookieName = authCookieMatch[0];

    // Try to reassemble chunked cookies (.0, .1, .2, …) or read the single cookie
    let raw = '';
    const singleCookie = request.cookies.get(cookieName);
    if (singleCookie?.value) {
      raw = singleCookie.value;
    } else {
      // Reassemble chunks
      for (let i = 0; i < 10; i++) {
        const chunk = request.cookies.get(`${cookieName}.${i}`);
        if (!chunk?.value) break;
        raw += chunk.value;
      }
    }

    if (!raw) return false;

    // The cookie value is base64-encoded JSON containing access_token
    let accessToken: string;
    try {
      const decoded = base64UrlDecode(raw);
      const parsed = JSON.parse(decoded);
      accessToken = parsed?.access_token;
    } catch {
      // Might already be raw JSON (some Supabase versions)
      try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        accessToken = parsed?.access_token;
      } catch {
        return false;
      }
    }

    if (!accessToken || typeof accessToken !== 'string') return false;

    // JWT structure: header.payload.signature
    const parts = accessToken.split('.');
    if (parts.length !== 3) return false;

    // Decode the payload (middle segment)
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);

    // Check required claims
    if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length === 0) {
      return false;
    }

    if (typeof payload.exp !== 'number') return false;

    // Check expiration (exp is in seconds since epoch)
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp <= nowSeconds) return false;

    return true;
  } catch {
    // Any unexpected error means the token is invalid
    return false;
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
