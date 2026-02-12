import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/admin/tracker/tasks/[id]
 * Toggle task completion
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { is_completed } = await req.json();

    const updates: any = { is_completed };
    if (is_completed) {
      updates.completed_at = new Date().toISOString();
    } else {
      updates.completed_at = null;
    }

    const { data, error } = await supabase
      .from('sprint_tasks')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
