import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { generation_id } = await req.json();
    if (!generation_id) return NextResponse.json({ ok: false });

    const supabase = createAdminClient();
    await supabase
      .from('code_generations')
      .update({ was_copied: true })
      .eq('id', generation_id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
