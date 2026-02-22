import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPlatformAdmin } from '@/lib/auth/admin';

/**
 * PATCH /api/admin/tracker/sprints/[id]
 * Update sprint status and notes
 */
export const PATCH = withPlatformAdmin(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const supabase = await createClient();
      const body = await req.json().catch(() => ({}));
      const { status, notes } = body;

      const updates: Record<string, unknown> = {};
      if (status) {
        updates.status = status;
        if (status === 'completed') {
          updates.completed_at = new Date().toISOString();
        }
      }
      if (notes !== undefined) {
        updates.notes = notes;
      }

      const { data, error } = await supabase
        .from('implementation_sprints')
        .update(updates)
        .eq('id', id)
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
);
