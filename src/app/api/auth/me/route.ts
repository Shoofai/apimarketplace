import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getRolePermissions } from '@/lib/auth/permissions';

/**
 * Returns information about the current authenticated user.
 * GET /api/auth/me
 */
export async function GET() {
  try {
    const context = await requireAuth();

    // Get user's permissions based on role
    const permissions = getRolePermissions(context.role);

    return NextResponse.json({
      user: context.user,
      organization_id: context.organization_id,
      role: context.role,
      permissions,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
