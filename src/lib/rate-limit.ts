/**
 * Rate limiter for API routes.
 *
 * Uses Redis for distributed rate limiting when REDIS_URL is configured.
 * Falls back to in-memory store (per-instance in serverless).
 */
import { getRedisClient } from '@/lib/cache/redis';

const memoryStore = new Map<string, { count: number; resetAt: number }>();

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

function makeResponse(retryAfterSec: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter: retryAfterSec,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSec),
      },
    }
  );
}

/**
 * Returns null if allowed, or Response with 429 if rate limited.
 * Tries Redis first for distributed limiting; falls back to in-memory.
 */
export async function rateLimitAsync(
  request: Request,
  config: RateLimitConfig
): Promise<Response | null> {
  const key = `rl:${getClientId(request)}`;
  const windowSec = Math.ceil((config.windowMs ?? WINDOW_MS) / 1000);

  try {
    const redis = await getRedisClient();
    if (redis) {
      const raw = await redis.get(key);
      const count = raw ? parseInt(raw, 10) : 0;

      if (count >= config.limit) {
        return makeResponse(windowSec);
      }

      // Increment: set new value preserving TTL window
      if (count === 0) {
        await redis.setEx(key, windowSec, '1');
      } else {
        await redis.setEx(key, windowSec, String(count + 1));
      }

      return null;
    }
  } catch {
    // Redis error — fall through to in-memory
  }

  // Fallback: in-memory (per-instance)
  return rateLimit(request, config);
}

/**
 * Synchronous in-memory rate limiter.
 * Returns null if allowed, or Response with 429 if rate limited.
 */
export function rateLimit(
  request: Request,
  config: RateLimitConfig
): Response | null {
  const key = getClientId(request);
  const windowMs = config.windowMs ?? WINDOW_MS;
  const now = Date.now();

  let entry = memoryStore.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    memoryStore.set(key, entry);
    return null;
  }

  entry.count++;
  if (entry.count > config.limit) {
    return makeResponse(Math.ceil((entry.resetAt - now) / 1000));
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
