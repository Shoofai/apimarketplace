import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Resolve a custom domain to an org slug via Supabase REST (no server-side cookies needed).
 * Returns the org slug or null if not found.
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
 * Security headers middleware.
 * Strict headers (CSP, HSTS, etc.) are only applied in production to avoid
 * Safari ChunkLoadError and other dev-only issues with chunk loading.
 * Also handles custom domain → internal portal rewrites.
 */
export async function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development';

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
    !request.nextUrl.pathname.startsWith('/portal/')
  ) {
    const orgSlug = await resolveCustomDomain(host);
    if (orgSlug) {
      const url = request.nextUrl.clone();
      url.pathname = `/portal/${orgSlug}`;
      return NextResponse.rewrite(url);
    }
  }

  // ?aff=<code> tracking: write a 30-day affiliate cookie
  const affCode = request.nextUrl.searchParams.get('aff');
  const response = NextResponse.next();

  if (affCode && /^[a-zA-Z0-9_-]{3,64}$/.test(affCode)) {
    response.cookies.set('aff', affCode, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: 'lax',
    });
  }

  if (!isDev) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com; frame-src https://js.stripe.com;"
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

  // Rate limiting headers (informational)
  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Remaining', '100');

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
