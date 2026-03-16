import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * GET  — Find-or-create a stakeholder + enterprise_profile for the current user.
 *        Returns { enterprise_id, stakeholder_id, profile }.
 * PATCH — Update allowed enterprise_profile fields.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Find stakeholder by user_id first, then fall back to email
  let { data: stakeholder } = await admin
    .from('stakeholders')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!stakeholder && user.email) {
    const { data: byEmail } = await admin
      .from('stakeholders')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();
    stakeholder = byEmail ?? null;
  }

  if (!stakeholder) {
    // Create a new stakeholder row
    const { data: newStakeholder, error: createErr } = await admin
      .from('stakeholders')
      .insert({
        user_id: user.id,
        email: user.email ?? '',
        stakeholder_type: 'enterprise_buyer',
        funnel_stage: 'captured',
      })
      .select('id')
      .single();

    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 500 });
    }
    stakeholder = newStakeholder;
  } else {
    // Back-fill user_id if it was null
    await admin
      .from('stakeholders')
      .update({ user_id: user.id })
      .eq('id', stakeholder.id)
      .is('user_id', null);
  }

  // Find or create enterprise_profile
  let { data: profile } = await admin
    .from('enterprise_profiles')
    .select('*')
    .eq('stakeholder_id', stakeholder.id)
    .maybeSingle();

  if (!profile) {
    const { data: newProfile, error: profileErr } = await admin
      .from('enterprise_profiles')
      .insert({ stakeholder_id: stakeholder.id })
      .select('*')
      .single();

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }
    profile = newProfile;
  }

  return NextResponse.json({
    enterprise_id: profile.id,
    stakeholder_id: stakeholder.id,
    profile,
  });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get the enterprise_profile for this user
  const { data: stakeholder } = await admin
    .from('stakeholders')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!stakeholder) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const body = await req.json();

  const allowed = [
    'company_name',
    'company_size',
    'industry',
    'estimated_employees',
    'annual_api_spend',
    'decision_maker_name',
    'decision_maker_title',
    'decision_maker_email',
    'champion_name',
    'champion_title',
    'pain_points',
    'current_tools',
    'apis_managed',
    'monthly_api_calls',
    'deal_notes',
    'enterprise_stage',
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await admin
    .from('enterprise_profiles')
    .update(updates)
    .eq('stakeholder_id', stakeholder.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
