/**
 * In-memory rate limiter for API routes.
 * Use per-IP or per-identifier. In serverless, limits are per-instance.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute

function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'unknown';
  return ip;
}

export type RateLimitConfig = {
  /** Max requests per window */
  limit: number;
  /** Window in ms (default 60000) */
  windowMs?: number;
};

/**
 * Returns null if allowed, or NextResponse with 429 if rate limited.
 */
export function rateLimit(
  request: Request,
  config: RateLimitConfig
): Response | null {
  const key = getClientId(request);
  const windowMs = config.windowMs ?? WINDOW_MS;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return null;
  }

  entry.count++;
  if (entry.count > config.limit) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      }
    );
  }
  return null;
}

/** Limits for specific route groups */
export const RATE_LIMITS = {
  auth: { limit: 10, windowMs: 60 * 1000 },
  analytics: { limit: 60, windowMs: 60 * 1000 },
  proxy: { limit: 30, windowMs: 60 * 1000 },
  forum: { limit: 20, windowMs: 60 * 1000 },
  reviews: { limit: 10, windowMs: 60 * 1000 },
  parseOpenApi: { limit: 15, windowMs: 60 * 1000 },
} as const;
