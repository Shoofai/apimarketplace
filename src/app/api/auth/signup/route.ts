import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSlug } from '@/lib/utils/slug';
import { logger } from '@/lib/utils/logger';
import { ValidationError } from '@/lib/utils/errors';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const rateLimited = rateLimit(request, RATE_LIMITS.auth);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const { user_id, email, full_name, organization_name, organization_slug, organization_type } = body;

    if (!user_id || !email || !full_name || !organization_name) {
      throw new ValidationError('Missing required fields');
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.id !== user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (user.email !== email) {
      return NextResponse.json({ error: 'Email does not match authenticated user' }, { status: 403 });
    }

    const admin = createAdminClient();

    // Validate org type — default to 'both' if not provided or invalid
    const validOrgTypes = ['consumer', 'provider', 'both'] as const;
    const orgType = validOrgTypes.includes(organization_type) ? organization_type : 'both';

    // 1. Create organization
    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({
        name: organization_name,
        slug: organization_slug || generateSlug(organization_name),
        type: orgType,
      })
      .select()
      .single();

    if (orgError) {
      logger.error('Failed to create organization', { error: orgError, user_id });
      throw new Error('Failed to create organization');
    }

    // 2. Create user record
    const { error: userError } = await admin.from('users').insert({
      id: user_id,
      email,
      full_name,
      current_organization_id: org.id,
      onboarding_completed: false,
    });

    if (userError) {
      logger.error('Failed to create user record', { error: userError, user_id });
      // Rollback: delete organization
      await admin.from('organizations').delete().eq('id', org.id);
      throw new Error('Failed to create user record');
    }

    // 3. Add user as owner of organization
    const { error: memberError } = await admin
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user_id,
        role: 'owner',
      });

    if (memberError) {
      logger.error('Failed to add user as org member', { error: memberError, user_id });
      // Rollback: delete user and organization
      await admin.from('users').delete().eq('id', user_id);
      await admin.from('organizations').delete().eq('id', org.id);
      throw new Error('Failed to create organization membership');
    }

    // Log the signup
    await admin.from('audit_logs').insert({
      user_id,
      action: 'user.signed_up',
      resource_type: 'user',
      resource_id: user_id,
      status: 'success',
      metadata: {
        organization_id: org.id,
        organization_name,
      },
    });

    logger.info('User signup completed', { user_id, org_id: org.id });

    // Referral reward: if the body includes a ref code, grant credits to both parties
    const { ref_code } = body;
    if (ref_code && typeof ref_code === 'string') {
      try {
        const REFERRAL_CREDITS = 100; // Credits granted to both referrer and new user

        // Find the referral record
        const { data: referral } = await admin
          .from('referrals')
          .select('id, referrer_user_id, referrer_organization_id')
          .eq('code', ref_code)
          .eq('status', 'pending')
          .maybeSingle();

        if (referral) {
          // Mark referral as completed
          await admin
            .from('referrals')
            .update({ status: 'completed', referred_user_id: user_id, converted_at: new Date().toISOString() } as any)
            .eq('id', referral.id);

          // Grant credits to referrer
          const { data: referrerBalance } = await admin
            .from('credit_balances')
            .select('balance')
            .eq('organization_id', referral.referrer_organization_id)
            .maybeSingle();
          const referrerNew = ((referrerBalance?.balance as number) ?? 0) + REFERRAL_CREDITS;
          await admin.from('credit_balances').upsert(
            { organization_id: referral.referrer_organization_id, balance: referrerNew, updated_at: new Date().toISOString() },
            { onConflict: 'organization_id' }
          );
          await admin.from('credit_ledger').insert({
            organization_id: referral.referrer_organization_id,
            amount: REFERRAL_CREDITS,
            type: 'referral',
            description: `Referral reward — ${email} signed up`,
            balance_after: referrerNew,
          } as any);

          // Grant credits to the new user
          await admin.from('credit_balances').upsert(
            { organization_id: org.id, balance: REFERRAL_CREDITS, updated_at: new Date().toISOString() },
            { onConflict: 'organization_id' }
          );
          await admin.from('credit_ledger').insert({
            organization_id: org.id,
            amount: REFERRAL_CREDITS,
            type: 'referral',
            description: 'Welcome bonus — referred signup',
            balance_after: REFERRAL_CREDITS,
          } as any);

          logger.info('Referral rewards granted', { ref_code, referrer_org: referral.referrer_organization_id, new_org: org.id });
        }
      } catch (refErr) {
        // Non-fatal — don't block signup if referral reward fails
        logger.warn('Referral reward failed', { error: refErr, ref_code });
      }
    }

    return NextResponse.json({
      success: true,
      organization_id: org.id,
    });
  } catch (error) {
    logger.error('Signup error', { error });

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
