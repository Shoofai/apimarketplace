'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Box,
  BarChart3,
  Code2,
  Zap,
  Users,
  Settings,
  Crown,
  Workflow,
  Globe,
  TestTube2,
} from 'lucide-react';

interface DashboardSidebarProps {
  user: {
    is_platform_admin: boolean;
    organizations?: {
      type: string;
    };
  };
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
  providerOnly?: boolean;
  consumerOnly?: boolean;
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.is_platform_admin;
  const orgType = user.organizations?.type;
  const isProvider = orgType === 'provider' || orgType === 'both';
  const isConsumer = orgType === 'consumer' || orgType === 'both';

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Marketplace',
      href: '/marketplace',
      icon: Globe,
    },
    {
      title: 'My APIs',
      href: '/dashboard/apis',
      icon: Box,
      providerOnly: true,
    },
    {
      title: 'Subscriptions',
      href: '/dashboard/subscriptions',
      icon: Users,
      consumerOnly: true,
    },
    {
      title: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      title: 'AI Playground',
      href: '/dashboard/playground',
      icon: Zap,
    },
    {
      title: 'Sandbox',
      href: '/dashboard/sandbox',
      icon: TestTube2,
    },
    {
      title: 'Workflows',
      href: '/dashboard/workflows',
      icon: Workflow,
    },
    {
      title: 'Collaborative Testing',
      href: '/dashboard/collab',
      icon: Code2,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const adminItems: NavItem[] = [
    {
      title: 'Admin Dashboard',
      href: '/dashboard/admin',
      icon: Crown,
      adminOnly: true,
    },
    {
      title: 'Review APIs',
      href: '/dashboard/admin/apis/review',
      icon: Box,
      adminOnly: true,
    },
    {
      title: 'Users',
      href: '/dashboard/admin/users',
      icon: Users,
      adminOnly: true,
    },
    {
      title: 'Organizations',
      href: '/dashboard/admin/organizations',
      icon: Users,
      adminOnly: true,
    },
    {
      title: 'Feature Flags',
      href: '/dashboard/admin/feature-flags',
      icon: Settings,
      adminOnly: true,
    },
    {
      title: 'Implementation Tracker',
      href: '/dashboard/admin/tracker',
      icon: BarChart3,
      adminOnly: true,
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.providerOnly && !isProvider) return false;
    if (item.consumerOnly && !isConsumer) return false;
    return true;
  });

  return (
    <aside className="hidden lg:block w-64 border-r bg-card min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {/* Main Navigation */}
        <div className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Platform Admin
              </div>
            </div>
            <div className="space-y-1">
              {adminItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}
