import { ReactNode } from 'react';
import { createClient, getUserSafe } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import DashboardNav from '@/components/dashboard/DashboardNav';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { FloatingQuickActions } from '@/components/dashboard/FloatingQuickActions';
import { getPlatformName } from '@/lib/settings/platform-name';
import { TooltipProvider } from '@/components/ui/tooltip';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Dashboard | ${name}`,
    description: 'Manage your APIs, subscriptions, and analytics',
    icons: {
      icon: '/favicon.svg',
      apple: '/favicon.svg',
    },
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  // Check authentication (handles invalid/expired refresh token without throwing)
  const {
    data: { user },
  } = await getUserSafe();

  if (!user) {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') ?? '/dashboard';
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select(`
      id,
      email,
      full_name,
      is_platform_admin,
      current_organization_id,
      organizations:current_organization_id (
        id,
        name,
        slug,
        type,
        plan
      )
    `)
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect('/login?redirect=/dashboard');
  }

  const org = Array.isArray(userData.organizations) ? userData.organizations[0] : userData.organizations;
  const userForNav = {
    ...userData,
    is_platform_admin: userData.is_platform_admin ?? false,
    organizations: org ? { name: org.name, plan: org.plan ?? 'free', type: org.type } : undefined,
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <DashboardNav user={userForNav} />

        <div className="flex">
          {/* Sidebar */}
          <DashboardSidebar user={userForNav} />

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>
        <FloatingQuickActions user={userForNav} />
      </div>
    </TooltipProvider>
  );
}
