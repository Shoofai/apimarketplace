import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPlatformAdmin } from '@/lib/auth/admin';

/**
 * GET /api/admin/tracker/sprints
 * List all sprints with progress
 */
export const GET = withPlatformAdmin(async () => {
  const supabase = await createClient();

  const { data: sprints, error } = await supabase
    .from('implementation_sprints')
    .select(
      `
      *,
      tasks:sprint_tasks(id, title, is_completed, completed_at),
      deliverables:sprint_deliverables(id, title, is_completed)
    `
    )
    .order('sprint_number');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate progress for each sprint
  const sprintsWithProgress = sprints?.map((sprint) => {
    const totalTasks = sprint.tasks?.length || 0;
    const completedTasks = sprint.tasks?.filter((t: any) => t.is_completed).length || 0;
    const totalDeliverables = sprint.deliverables?.length || 0;
    const completedDeliverables =
      sprint.deliverables?.filter((d: any) => d.is_completed).length || 0;

    return {
      ...sprint,
      progress: {
        tasks: { total: totalTasks, completed: completedTasks },
        deliverables: { total: totalDeliverables, completed: completedDeliverables },
        percentage:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    };
  });

  return NextResponse.json({ sprints: sprintsWithProgress });
});

/**
 * PATCH /api/admin/tracker/sprints/[id]
 * Update sprint status and notes
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { status, notes } = await req.json();

    const updates: any = {};
    if (status) {
      updates.status = status;
      if (status === 'completed' && !updates.completed_at) {
        updates.completed_at = new Date().toISOString();
      }
    }
    if (notes !== undefined) {
      updates.notes = notes;
    }

    const { data, error } = await supabase
      .from('implementation_sprints')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sprint: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
