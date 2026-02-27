import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError, ForbiddenError } from '@/lib/utils/errors';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuth();
    const { id: apiId } = await params;
    const supabase = await createClient();

    const { data: api } = await supabase
      .from('apis')
      .select('id, organization_id, base_url')
      .eq('id', apiId)
      .single();
    if (!api || (api as { organization_id: string }).organization_id !== ctx.organization_id) {
      throw new ForbiddenError('Not authorized to run contracts for this API');
    }

    const baseUrl = ((api as { base_url?: string }).base_url || '').replace(/\/$/, '');

    const { data: contracts } = await supabase
      .from('api_contracts')
      .select('id, endpoint_id, expected_status_codes, max_latency_ms')
      .eq('api_id', apiId)
      .eq('is_active', true);

    if (!contracts?.length) {
      return NextResponse.json({ error: 'No active contracts to run' }, { status: 400 });
    }

    const { data: run, error: runError } = await supabase
      .from('contract_test_runs')
      .insert({
        api_id: apiId,
        started_at: new Date().toISOString(),
        status: 'running',
        total_tests: contracts.length,
        passed_tests: 0,
        failed_tests: 0,
        triggered_by: ctx.user.id,
      })
      .select()
      .single();

    if (runError || !run) {
      return NextResponse.json({ error: runError?.message || 'Failed to create run' }, { status: 500 });
    }

    const runId = (run as { id: string }).id;
    let passed = 0;
    let failed = 0;

    for (const contract of contracts as Array<{ id: string; endpoint_id: string; expected_status_codes: number[] | null; max_latency_ms: number | null }>) {
      const { data: endpoint } = await supabase
        .from('api_endpoints')
        .select('id, method, path')
        .eq('id', contract.endpoint_id)
        .single();

      let status: string;
      let actualStatusCode: number | null = null;
      let actualLatencyMs: number | null = null;
      let failureReason: string | null = null;
      let responseSample: unknown = null;

      if (!endpoint) {
        status = 'failed';
        failureReason = 'Endpoint not found';
        failed++;
      } else {
        const method = ((endpoint as { method?: string }).method || 'GET').toUpperCase();
        const path = (endpoint as { path?: string }).path || '/';
        const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
        const start = Date.now();
        try {
          const res = await fetch(url, {
            method,
            signal: AbortSignal.timeout(15000),
            headers: { Accept: 'application/json' },
          });
          actualLatencyMs = Date.now() - start;
          actualStatusCode = res.status;
          const text = await res.text();
          try {
            responseSample = JSON.parse(text);
          } catch {
            responseSample = text.slice(0, 500);
          }

          const expected = contract.expected_status_codes ?? [200];
          const ok = expected.includes(actualStatusCode);
          const latencyOk =
            contract.max_latency_ms == null || (actualLatencyMs != null && actualLatencyMs <= contract.max_latency_ms);

          if (ok && latencyOk) {
            status = 'passed';
            passed++;
          } else {
            status = 'failed';
            failed++;
            if (!ok) failureReason = `Expected status in ${JSON.stringify(expected)}, got ${actualStatusCode}`;
            else if (!latencyOk) failureReason = `Latency ${actualLatencyMs}ms exceeds max ${contract.max_latency_ms}ms`;
          }
        } catch (err) {
          status = 'failed';
          failed++;
          failureReason = err instanceof Error ? err.message : 'Request failed';
          actualLatencyMs = Date.now() - start;
        }
      }

      await supabase.from('contract_test_results').insert({
        contract_id: contract.id,
        test_run_id: runId,
        endpoint_id: contract.endpoint_id,
        status,
        actual_status_code: actualStatusCode,
        actual_latency_ms: actualLatencyMs,
        actual_response_sample: responseSample,
        failure_reason: failureReason,
      });
    }

    await supabase
      .from('contract_test_runs')
      .update({
        completed_at: new Date().toISOString(),
        status: 'completed',
        passed_tests: passed,
        failed_tests: failed,
      })
      .eq('id', runId);

    return NextResponse.json({
      run: { id: runId, passed_tests: passed, failed_tests: failed, total_tests: contracts.length },
    });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}
