import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { WorkflowEngine } from '@/lib/workflows/engine';
import { AuthError } from '@/lib/utils/errors';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';

/**
 * Execute a workflow by id.
 * POST /api/workflows/[id]/execute
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id: workflowId } = await params;
    const supabase = await createClient();

    const { data: workflow, error } = await supabase
      .from('workflow_definitions')
      .select('id, organization_id')
      .eq('id', workflowId)
      .single();

    if (error || !workflow) {
      throw new NotFoundError('Workflow not found');
    }

    if ((workflow as { organization_id?: string }).organization_id !== context.organization_id) {
      throw new ForbiddenError('Not authorized to execute this workflow');
    }

    const body = await request.json().catch(() => ({}));
    const input = body?.input ?? body?.triggerData ?? {};

    const engine = new WorkflowEngine();
    const result = await engine.execute(workflowId, input);

    return NextResponse.json({ result });
  } catch (e: unknown) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    if (e instanceof NotFoundError) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    throw e;
  }
}
