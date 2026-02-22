import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPlatformAdmin } from '@/lib/auth/admin';

/**
 * PATCH /api/admin/tracker/deliverables/[id]
 * Toggle deliverable completion
 */
export const PATCH = withPlatformAdmin(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const supabase = await createClient();
      const { is_completed } = await req.json();

      const updates: Record<string, unknown> = { is_completed };
      if (is_completed) {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }

      const { data, error } = await supabase
        .from('sprint_deliverables')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ deliverable: data });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
);
