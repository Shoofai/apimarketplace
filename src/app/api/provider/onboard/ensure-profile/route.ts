import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * Ensures the current user has a stakeholder and provider_profile for the provider funnel.
 * Returns provider_id for use in the onboarding wizard. Creates stakeholder and
 * provider_profile if missing (service role).
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Find stakeholder by user_id first, then by email
  let { data: stakeholder } = await admin
    .from('stakeholders')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!stakeholder) {
    const { data: byEmail } = await admin
      .from('stakeholders')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();
    stakeholder = byEmail ?? null;
  }

  if (!stakeholder) {
    const { data: inserted, error: insertErr } = await admin
      .from('stakeholders')
      .insert({
        email: user.email,
        user_id: user.id,
        full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        stakeholder_type: 'api_provider',
        capture_source: 'direct',
      })
      .select('id')
      .single();

    if (insertErr || !inserted) {
      return NextResponse.json(
        { error: insertErr?.message ?? 'Failed to create stakeholder' },
        { status: 500 }
      );
    }
    stakeholder = inserted;
  } else {
    // Optionally link user_id if it was missing
    await admin
      .from('stakeholders')
      .update({ user_id: user.id })
      .eq('id', stakeholder.id)
      .is('user_id', null);
  }

  // Find or create provider_profile
  let { data: profile } = await admin
    .from('provider_profiles')
    .select('id')
    .eq('stakeholder_id', stakeholder.id)
    .maybeSingle();

  if (!profile) {
    const { data: inserted, error: profileErr } = await admin
      .from('provider_profiles')
      .insert({ stakeholder_id: stakeholder.id })
      .select('id')
      .single();

    if (profileErr || !inserted) {
      return NextResponse.json(
        { error: profileErr?.message ?? 'Failed to create provider profile' },
        { status: 500 }
      );
    }
    profile = inserted;
  }

  return NextResponse.json({ provider_id: profile.id, stakeholder_id: stakeholder.id });
}
