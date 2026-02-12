import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSlug } from '@/lib/utils/slug';
import { logger } from '@/lib/utils/logger';
import { ValidationError } from '@/lib/utils/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, email, full_name, organization_name, organization_slug } = body;

    if (!user_id || !email || !full_name || !organization_name) {
      throw new ValidationError('Missing required fields');
    }

    const supabase = createAdminClient();

    // Start a transaction-like operation
    // 1. Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organization_name,
        slug: organization_slug || generateSlug(organization_name),
        type: 'both', // Default to both provider and consumer
      })
      .select()
      .single();

    if (orgError) {
      logger.error('Failed to create organization', { error: orgError, user_id });
      throw new Error('Failed to create organization');
    }

    // 2. Create user record
    const { error: userError } = await supabase.from('users').insert({
      id: user_id,
      email,
      full_name,
      current_organization_id: org.id,
      onboarding_completed: false,
    });

    if (userError) {
      logger.error('Failed to create user record', { error: userError, user_id });
      // Rollback: delete organization
      await supabase.from('organizations').delete().eq('id', org.id);
      throw new Error('Failed to create user record');
    }

    // 3. Add user as owner of organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user_id,
        role: 'owner',
      });

    if (memberError) {
      logger.error('Failed to add user as org member', { error: memberError, user_id });
      // Rollback: delete user and organization
      await supabase.from('users').delete().eq('id', user_id);
      await supabase.from('organizations').delete().eq('id', org.id);
      throw new Error('Failed to create organization membership');
    }

    // Log the signup
    await supabase.from('audit_logs').insert({
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
