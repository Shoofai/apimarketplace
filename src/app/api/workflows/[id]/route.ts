// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError, NotFoundError, ForbiddenError } from '@/lib/utils/errors';

/**
 * Update a workflow.
 * PATCH /api/workflows/[id]
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { data: existing } = await supabase
      .from('workflow_definitions')
      .select('id, organization_id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new NotFoundError('Workflow not found');
    }
    if ((existing as { organization_id?: string }).organization_id !== context.organization_id) {
      throw new ForbiddenError('Not authorized to update this workflow');
    }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) update.name = String(body.name).trim();
    if (body.description !== undefined) update.description = body.description ? String(body.description).trim() : null;
    if (Array.isArray(body.nodes)) update.nodes = body.nodes;
    if (Array.isArray(body.edges)) update.edges = body.edges;
    if (body.status !== undefined) update.status = body.status;

    const { data: workflow, error } = await supabase
      .from('workflow_definitions')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ workflow });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}
