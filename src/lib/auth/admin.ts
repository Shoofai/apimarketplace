import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Platform admin middleware
 * Restricts access to platform administrators only
 */
export async function requirePlatformAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Check if user is platform admin
  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    throw new Error('Forbidden: Platform admin access required');
  }

  return { user, userData };
}

/**
 * Admin API route wrapper
 */
export function withPlatformAdmin(
  handler: (req: Request, context: any) => Promise<Response>
) {
  return async (req: Request, context: any) => {
    try {
      await requirePlatformAdmin();
      return handler(req, context);
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  };
}
