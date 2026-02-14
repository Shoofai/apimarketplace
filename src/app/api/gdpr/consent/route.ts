import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const CONSENT_VERSION = '1.0';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { consent_preferences } = body;

    if (!consent_preferences || typeof consent_preferences !== 'object') {
      return NextResponse.json(
        { error: 'consent_preferences object is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const admin = createAdminClient();
    const ip_address = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? null;
    const user_agent = request.headers.get('user-agent') ?? null;

    const { error } = await admin.from('gdpr_consent_logs').insert({
      user_id: user?.id ?? null,
      consent_preferences,
      consent_version: CONSENT_VERSION,
      ip_address,
      user_agent,
    });

    if (error) {
      console.error('GDPR consent log insert error', error);
      return NextResponse.json(
        { error: 'Failed to record consent' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('GDPR consent error', e);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
