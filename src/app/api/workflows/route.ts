import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

/**
 * List workflows for the current organization.
 * GET /api/workflows
 */
export async function GET() {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const { data: workflows, error } = await supabase
      .from('workflow_definitions')
      .select('id, name, description, status, nodes, edges, created_at, updated_at, last_executed_at, execution_count')
      .eq('organization_id', context.organization_id)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ workflows: workflows ?? [] });
  } catch (e: unknown) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    throw e;
  }
}

/**
 * Create a new workflow.
 * POST /api/workflows
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const body = await request.json();
    const { name, description, nodes, edges } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const insert: Record<string, unknown> = {
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() || null : null,
      nodes: Array.isArray(nodes) ? nodes : [],
      edges: Array.isArray(edges) ? edges : [],
      status: 'draft',
    };

    // Add organization_id and user_id if columns exist (optional for backwards compatibility)
    const { data: def, error } = await supabase
      .from('workflow_definitions')
      .insert({
        ...insert,
        organization_id: context.organization_id,
        user_id: context.user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workflow: def });
  } catch (e: unknown) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    throw e;
  }
}
