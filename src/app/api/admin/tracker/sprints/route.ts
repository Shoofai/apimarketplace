import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPlatformAdmin } from '@/lib/auth/admin';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

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
      deliverables:sprint_deliverables(id, name, is_completed)
    `
    )
    .order('sprint_number')
    .limit(DEFAULT_LIST_LIMIT);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map deliverables name -> title for UI; calculate progress for each sprint
  const sprintsWithProgress = sprints?.map((sprint) => {
    const tasks = sprint.tasks ?? [];
    const rawDeliverables = sprint.deliverables ?? [];
    const deliverables = rawDeliverables.map((d: any) => ({
      ...d,
      title: d.title ?? d.name ?? '',
    }));
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.is_completed).length;
    const totalDeliverables = deliverables.length;
    const completedDeliverables = deliverables.filter((d: any) => d.is_completed).length;

    return {
      ...sprint,
      tasks,
      deliverables,
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
