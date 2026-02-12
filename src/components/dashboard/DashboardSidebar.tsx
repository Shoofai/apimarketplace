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
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardSidebarProps {
  user: {
    is_platform_admin: boolean;
    organizations?: {
      type: string;
      plan: string;
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
  comingSoon?: boolean;
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.is_platform_admin;
  const orgType = user.organizations?.type;
  const orgPlan = user.organizations?.plan;
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
      icon: Layers,
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
      badge: orgPlan === 'free' ? '50/day' : undefined,
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
      comingSoon: orgPlan === 'free',
    },
    {
      title: 'Collaborative Testing',
      href: '/dashboard/collab',
      icon: Code2,
      comingSoon: orgPlan === 'free',
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
    <aside className="hidden lg:block w-64 border-r bg-card/50 min-h-[calc(100vh-4rem)] backdrop-blur-sm">
      <nav className="p-4 space-y-6">
        {/* Main Navigation */}
        <div>
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Main
            </h3>
          </div>
          <div className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || (pathname !== '/dashboard' && pathname.startsWith(item.href + '/'));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.comingSoon ? '#' : item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    item.comingSoon && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={(e) => item.comingSoon && e.preventDefault()}
                >
                  <Icon className={cn('h-4 w-4', isActive && 'text-primary-foreground')} />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                      {item.badge}
                    </Badge>
                  )}
                  {item.comingSoon && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                      Soon
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div>
            <div className="px-3 mb-2">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="h-3 w-3" />
                Platform Admin
              </h3>
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
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive && 'text-primary-foreground')} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Upgrade CTA for Free Users */}
        {orgPlan === 'free' && (
          <div className="px-3 pt-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Upgrade to Pro
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Unlock unlimited AI generations, workflows, and collaboration
              </p>
              <Link href="/pricing">
                <Button size="sm" className="w-full">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
