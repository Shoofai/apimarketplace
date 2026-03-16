import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

interface ScheduleDemoBody {
  enterprise_id?: string;
  stakeholder_id?: string;
  /** ISO string from Calendly postMessage payload */
  scheduled_at?: string;
}

export async function POST(req: Request) {
  try {
    const body: ScheduleDemoBody = await req.json();
    const admin = createAdminClient();

    const scheduledAt = body.scheduled_at ?? new Date().toISOString();

    if (body.enterprise_id) {
      const { error } = await admin
        .from('enterprise_profiles')
        .update({
          demo_scheduled_at: scheduledAt,
          enterprise_stage: 'demo_scheduled',
        })
        .eq('id', body.enterprise_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Fire nurture sequence (fire-and-forget)
    if (body.stakeholder_id) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && serviceKey) {
        fetch(`${supabaseUrl}/functions/v1/enterprise-nurture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({
            stakeholder_id: body.stakeholder_id,
            stage: 'demo_scheduled',
          }),
        }).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true, scheduled_at: scheduledAt });
  } catch (e) {
    console.error('/api/enterprise/schedule-demo error:', e);
    return NextResponse.json({ error: 'Failed to schedule demo' }, { status: 500 });
  }
}
