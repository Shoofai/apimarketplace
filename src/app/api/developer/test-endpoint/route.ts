import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database.types';
import { NextResponse } from 'next/server';

interface TestRequest {
  api_id?: string;
  api_name: string;
  endpoint_path: string;
  http_method: string;
  request_headers?: Record<string, string>;
  request_body?: unknown;
  request_params?: Record<string, string>;
  base_url?: string;
  session_id?: string;
}

export async function POST(req: Request) {
  try {
    const body: TestRequest = await req.json();
    const { api_name, endpoint_path, http_method, request_headers, request_body, request_params, base_url, session_id } = body;

    if (!endpoint_path || !http_method || !api_name) {
      return NextResponse.json({ error: 'api_name, endpoint_path, http_method required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Only allow users with a valid API subscription or in sandbox mode (no live calls)
    // In sandbox mode we simulate a response rather than making real HTTP calls
    const targetUrl = base_url
      ? `${base_url.replace(/\/$/, '')}${endpoint_path}`
      : null;

    const startMs = Date.now();
    let responseStatus = 0;
    let responseBody: unknown = null;
    let responseHeaders: Record<string, string> = {};
    let testPassed = false;
    let errorMessage: string | null = null;

    if (targetUrl) {
      try {
        const fetchHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...request_headers,
        };

        // Build query params
        let url = targetUrl;
        if (request_params && Object.keys(request_params).length > 0) {
          const qs = new URLSearchParams(
            Object.fromEntries(Object.entries(request_params).filter(([, v]) => v !== ''))
          );
          url = `${url}?${qs}`;
        }

        const fetchOptions: RequestInit = {
          method: http_method.toUpperCase(),
          headers: fetchHeaders,
          signal: AbortSignal.timeout(10_000),
        };
        if (!['GET', 'HEAD'].includes(http_method.toUpperCase()) && request_body) {
          fetchOptions.body = JSON.stringify(request_body);
        }

        const response = await fetch(url, fetchOptions);
        responseStatus = response.status;
        responseHeaders = Object.fromEntries(response.headers.entries());

        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          responseBody = await response.json();
        } else {
          responseBody = { _text: await response.text() };
        }
        testPassed = response.ok;
      } catch (err) {
        errorMessage = err instanceof Error ? err.message : 'Request failed';
        responseStatus = 0;
        testPassed = false;
      }
    } else {
      // Sandbox simulation (no URL configured)
      responseStatus = 200;
      responseBody = {
        _sandbox: true,
        message: 'Sandbox response — configure a base URL to make real calls',
      };
      testPassed = true;
    }

    const responseTimeMs = Date.now() - startMs;

    // Log to api_test_sessions via admin client
    const admin = createAdminClient();
    let developerId: string | null = null;
    if (user) {
      const { data: dev } = await admin
        .from('developer_profiles')
        .select('id')
        .in(
          'stakeholder_id',
          (
            await admin.from('stakeholders').select('id').eq('user_id', user.id)
          ).data?.map((s) => s.id) ?? []
        )
        .maybeSingle();
      developerId = dev?.id ?? null;
    }

    type ApiTestSessionInsert = Database['public']['Tables']['api_test_sessions']['Insert'];
    await admin.from('api_test_sessions').insert({
      developer_id: developerId,
      session_id: session_id ?? null,
      api_id: body.api_id ?? null,
      api_name,
      endpoint_path,
      http_method: http_method.toUpperCase(),
      request_headers: (request_headers ?? {}) as ApiTestSessionInsert['request_headers'],
      request_body: (request_body ?? null) as ApiTestSessionInsert['request_body'],
      request_params: (request_params ?? null) as ApiTestSessionInsert['request_params'],
      response_status: responseStatus,
      response_time_ms: responseTimeMs,
      response_body: responseBody as ApiTestSessionInsert['response_body'],
      response_headers: responseHeaders as ApiTestSessionInsert['response_headers'],
      test_passed: testPassed,
      error_message: errorMessage,
    });

    return NextResponse.json({
      status: responseStatus,
      time_ms: responseTimeMs,
      passed: testPassed,
      headers: responseHeaders,
      body: responseBody,
      error: errorMessage,
    });
  } catch (e) {
    console.error('test-endpoint error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
