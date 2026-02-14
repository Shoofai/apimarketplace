import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/dashboard/DashboardNav';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default async function MarketplaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
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
    redirect('/login');
  }

  const org = Array.isArray(userData.organizations) ? userData.organizations[0] : userData.organizations;
  const userForNav = {
    ...userData,
    is_platform_admin: userData.is_platform_admin ?? false,
    organizations: org ? { name: org.name, plan: org.plan ?? 'free', type: org.type } : undefined,
  };

  return (
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
    </div>
  );
}
