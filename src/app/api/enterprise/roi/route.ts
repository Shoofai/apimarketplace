import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const admin = createAdminClient();

    const { data, error } = await admin.functions.invoke('enterprise-roi', { body });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error('/api/enterprise/roi error:', e);
    return NextResponse.json({ error: 'Failed to calculate ROI' }, { status: 500 });
  }
}
