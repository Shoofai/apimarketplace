import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/apis/[id]/sla
 * Returns the SLA definition, last 30 measurements, and unacknowledged violations.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: definition } = await supabase
      .from('sla_definitions')
      .select('*')
      .eq('api_id', id)
      .eq('is_active', true)
      .maybeSingle();

    const { data: measurements } = await supabase
      .from('sla_measurements')
      .select('id, window_start, window_end, uptime_percentage, error_rate, latency_p50_ms, latency_p95_ms, total_requests, failed_requests, is_within_sla')
      .eq('api_id', id)
      .order('window_end', { ascending: false })
      .limit(30);

    const { data: violations } = await supabase
      .from('sla_violations')
      .select('id, violation_type, severity, actual_value, target_value, acknowledged, created_at')
      .eq('api_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({ definition, measurements: measurements ?? [], violations: violations ?? [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * PATCH /api/apis/[id]/sla
 * Upsert the SLA definition for an API (provider/org-member only).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    const { data: api } = await supabase
      .from('apis')
      .select('organization_id')
      .eq('id', id)
      .single();

    if (!api || api.organization_id !== context.organization_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { uptime_target, latency_p50_target_ms, latency_p95_target_ms, error_rate_target, measurement_window } = body;

    const { data: existing } = await supabase
      .from('sla_definitions')
      .select('id')
      .eq('api_id', id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('sla_definitions')
        .update({
          uptime_target: uptime_target ?? null,
          latency_p50_target_ms: latency_p50_target_ms ?? null,
          latency_p95_target_ms: latency_p95_target_ms ?? null,
          error_rate_target: error_rate_target ?? null,
          measurement_window: measurement_window ?? '1h',
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('sla_definitions')
        .insert({
          api_id: id,
          uptime_target: uptime_target ?? null,
          latency_p50_target_ms: latency_p50_target_ms ?? null,
          latency_p95_target_ms: latency_p95_target_ms ?? null,
          error_rate_target: error_rate_target ?? null,
          measurement_window: measurement_window ?? '1h',
          is_active: true,
        });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/apis/[id]/sla/violations/[vid]/acknowledge
 * Handled separately below — acknowledge a violation.
 */
