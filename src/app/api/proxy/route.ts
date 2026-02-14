import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * Proxies API requests from the sandbox to avoid CORS and inject auth if needed.
 * POST /api/proxy
 * Body: { method, url, headers?, body?, subscription_id? }
 * - subscription_id: optional; if provided we do not have plain API key in DB so auth must be set by client.
 * - Forwards request to url and returns { status, headers, body, latency }.
 */
export async function POST(request: Request) {
  const rateLimited = rateLimit(request, RATE_LIMITS.proxy);
  if (rateLimited) return rateLimited;

  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { method, url, headers = {}, body } = await request.json();

    if (!method || !url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'method and url are required' },
        { status: 400 }
      );
    }

    const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    if (!allowedMethods.includes(method.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP(S) URLs are allowed' }, { status: 400 });
    }

    const hostname = targetUrl.hostname.toLowerCase();
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      '[::1]',
    ];
    const blockedPatterns = [
      /^10\./,                                    // 10.0.0.0/8
      /^172\.(1[6-9]|2\d|3[01])\./,               // 172.16.0.0/12
      /^192\.168\./,                              // 192.168.0.0/16
      /^169\.254\./,                              // link-local / metadata
      /^fc00:/i,                                  // IPv6 unique local
      /^fe80:/i,                                  // IPv6 link-local
    ];
    if (blockedHosts.includes(hostname)) {
      return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
    }
    if (blockedPatterns.some((re) => re.test(hostname))) {
      return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
    }

    const start = Date.now();
    const fetchHeaders: Record<string, string> = { ...headers };
    if (body !== undefined && body !== null && method !== 'GET' && method !== 'HEAD') {
      if (!fetchHeaders['Content-Type']) {
        fetchHeaders['Content-Type'] = 'application/json';
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers: fetchHeaders,
      signal: AbortSignal.timeout(30000),
    };

    if (body !== undefined && body !== null && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const latency = Date.now() - start;
    const responseBody = await response.text();

    let parsedBody: unknown = responseBody;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        parsedBody = JSON.parse(responseBody);
      } catch {
        // leave as string
      }
    }

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      if (!key.toLowerCase().startsWith('transfer-encoding')) {
        responseHeaders[key] = value;
      }
    });

    return NextResponse.json({
      status: response.status,
      headers: responseHeaders,
      body: parsedBody,
      latency,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Proxy request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
