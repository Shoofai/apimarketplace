import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase.functions.invoke('generate-code', {
      body,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error('generate-code route error:', e);
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
  }
}
