import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: invite, error } = await supabase
      .from('prelaunch_invite_codes')
      .select('id, uses_count, max_uses, expires_at, is_active')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle();

    if (error || !invite) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    if (!invite.is_active) {
      return NextResponse.json({ error: 'This code has been revoked' }, { status: 410 });
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This code has expired' }, { status: 410 });
    }

    if (invite.uses_count >= invite.max_uses) {
      return NextResponse.json({ error: 'This code has reached its maximum uses' }, { status: 410 });
    }

    // Increment use count
    await supabase
      .from('prelaunch_invite_codes')
      .update({ uses_count: invite.uses_count + 1 })
      .eq('id', invite.id);

    // Set httpOnly early_access cookie containing the invite code UUID
    const response = NextResponse.json({ success: true });
    response.cookies.set('early_access', invite.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      // Expires in 30 days or at code expiry, whichever comes first
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to redeem code' }, { status: 500 });
  }
}
