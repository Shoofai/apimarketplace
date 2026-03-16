import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * Ensures the current user has a stakeholder + developer_profile row.
 * Returns developer_id. Creates missing rows via service role.
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

  // Find stakeholder by user_id, then email
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
        full_name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.user_metadata?.user_name ??
          null,
        stakeholder_type: 'developer',
        capture_source: 'direct',
      })
      .select('id')
      .single();

    if (insertErr || !inserted) {
      return NextResponse.json({ error: insertErr?.message ?? 'Failed to create stakeholder' }, { status: 500 });
    }
    stakeholder = inserted;
  } else {
    // Ensure user_id is linked
    await admin
      .from('stakeholders')
      .update({ user_id: user.id })
      .eq('id', stakeholder.id)
      .is('user_id', null);
  }

  // Find or create developer_profile
  let { data: profile } = await admin
    .from('developer_profiles')
    .select('id, developer_stage, preferred_language, preferred_framework, experience_level, use_case, github_username, referral_code, code_generations, total_api_calls')
    .eq('stakeholder_id', stakeholder.id)
    .maybeSingle();

  if (!profile) {
    // Check for GitHub username from OAuth metadata
    const githubUsername =
      user.user_metadata?.user_name ??
      user.user_metadata?.preferred_username ??
      null;

    const { data: inserted, error: profileErr } = await admin
      .from('developer_profiles')
      .insert({
        stakeholder_id: stakeholder.id,
        developer_stage: 'signed_up',
        github_username: githubUsername,
        primary_language:
          user.user_metadata?.preferred_language ?? 'javascript',
      })
      .select('id, developer_stage, preferred_language, preferred_framework, experience_level, use_case, github_username, referral_code, code_generations, total_api_calls')
      .single();

    if (profileErr || !inserted) {
      return NextResponse.json({ error: profileErr?.message ?? 'Failed to create developer profile' }, { status: 500 });
    }
    profile = inserted;
  }

  return NextResponse.json({
    developer_id: profile.id,
    stakeholder_id: stakeholder.id,
    profile,
  });
}

/**
 * PATCH — update developer preferences (language, framework, experience, use_case, etc.)
 */
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const allowed = [
    'preferred_language',
    'preferred_framework',
    'primary_language',
    'experience_level',
    'use_case',
    'tech_stack',
    'github_username',
    'referred_by',
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: stakeholder } = await admin
    .from('stakeholders')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!stakeholder) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const { error } = await admin
    .from('developer_profiles')
    .update(updates)
    .eq('stakeholder_id', stakeholder.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
