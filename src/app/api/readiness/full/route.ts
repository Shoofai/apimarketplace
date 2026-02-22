import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { runSpecAudit } from '@/lib/readiness/spec-audit';
import { AuthError } from '@/lib/utils/errors';

/**
 * POST /api/readiness/full
 * Run full spec audit for an API and store report. Requires auth and org plan !== 'free'.
 */
export async function POST(request: NextRequest) {
  try {
    const context = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const api_id = (body as { api_id?: string }).api_id;

    if (!api_id || typeof api_id !== 'string') {
      return NextResponse.json({ error: 'api_id is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: api, error: apiError } = await supabase
      .from('apis')
      .select('id, organization_id, api_specs(openapi_spec)')
      .eq('id', api_id)
      .eq('organization_id', context.organization_id)
      .single();

    if (apiError || !api) {
      return NextResponse.json({ error: 'API not found or access denied' }, { status: 404 });
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', context.organization_id)
      .single();

    if (org?.plan === 'free') {
      return NextResponse.json(
        { error: 'Upgrade to Pro or Enterprise to run full Production Readiness audits' },
        { status: 403 }
      );
    }

    const specRow = (api as { api_specs?: { openapi_spec?: unknown }[] | { openapi_spec?: unknown } }).api_specs;
    const spec = (Array.isArray(specRow) ? specRow[0]?.openapi_spec : specRow?.openapi_spec) as Record<string, unknown> | null;
    if (!spec || typeof spec !== 'object') {
      return NextResponse.json(
        { error: 'API has no OpenAPI spec. Add a spec to run an audit.' },
        { status: 400 }
      );
    }

    const result = runSpecAudit(spec, 50);
    const payload = {
      gaps: result.gaps,
      shipChecklist: [
        { id: 'spec-quality', label: 'Spec quality', status: result.score >= 70 ? 'pass' as const : 'fail' as const, detail: `Score: ${result.score}/100` },
        { id: 'no-critical', label: 'No critical gaps', status: result.gaps.some(g => g.severity === 'critical') ? 'fail' as const : 'pass' as const, detail: null },
      ],
      shipChecklistStatus: result.score >= 70 && !result.gaps.some(g => g.severity === 'critical') ? 'ship' : 'no-ship',
      generatedAt: new Date().toISOString(),
      schemaVersion: '1.0',
    };

    const { data: report, error: insertError } = await supabase
      .from('api_readiness_reports')
      .insert({
        api_id: api.id,
        organization_id: context.organization_id,
        scope: 'full',
        payload,
        score: result.score,
        created_by: context.user.id,
      })
      .select('id, score, created_at')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      id: report.id,
      score: report.score,
      created_at: report.created_at,
      gapCount: result.gaps.length,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    throw e;
  }
}
