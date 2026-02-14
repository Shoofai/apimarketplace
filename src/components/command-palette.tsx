'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Box,
  Globe,
  BarChart3,
  Zap,
  TestTube2,
  Workflow,
  Code2,
  Settings,
  Crown,
  Users,
  Layers,
  Heart,
  User,
  Building2,
  Key,
  CreditCard,
  Shield,
  LogOut,
  Plus,
  FileText,
  Bell,
  Webhook,
  Lock,
  Gauge,
} from 'lucide-react';

interface CommandPaletteProps {
  user: {
    is_platform_admin?: boolean;
    organizations?: {
      type?: string;
      plan?: string;
      name?: string;
    };
  };
}

interface CommandItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  shortcut?: string;
  adminOnly?: boolean;
  providerOnly?: boolean;
  consumerOnly?: boolean;
  planRequired?: 'pro' | 'enterprise';
}

export function CommandPalette({ user }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const isAdmin = user.is_platform_admin ?? false;
  const orgType = user.organizations?.type;
  const orgPlan = user.organizations?.plan;
  const isProvider = orgType === 'provider' || orgType === 'both';
  const isConsumer = orgType === 'consumer' || orgType === 'both';

  // Keyboard shortcut listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  // Navigation items
  const pageItems: CommandItem[] = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      shortcut: 'G D',
    },
    {
      label: 'Marketplace',
      icon: Globe,
      href: '/marketplace',
      shortcut: 'G M',
    },
    {
      label: 'My APIs',
      icon: Box,
      href: '/dashboard/apis',
      providerOnly: true,
    },
    {
      label: 'Subscriptions',
      icon: Layers,
      href: '/dashboard/subscriptions',
      consumerOnly: true,
    },
    {
      label: 'My Favorites',
      icon: Heart,
      href: '/dashboard/favorites',
      consumerOnly: true,
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      shortcut: 'G A',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      shortcut: 'G S',
    },
  ];

  const toolItems: CommandItem[] = [
    {
      label: 'AI Playground',
      icon: Zap,
      href: '/dashboard/playground',
    },
    {
      label: 'API Sandbox',
      icon: TestTube2,
      href: '/dashboard/sandbox',
    },
    {
      label: 'Workflows',
      icon: Workflow,
      href: '/dashboard/workflows',
      planRequired: orgPlan === 'free' ? 'pro' : undefined,
    },
    {
      label: 'Collaborative Testing',
      icon: Code2,
      href: '/dashboard/collab',
      planRequired: orgPlan === 'free' ? 'pro' : undefined,
    },
  ];

  const adminItems: CommandItem[] = [
    {
      label: 'Admin Dashboard',
      icon: Crown,
      href: '/dashboard/admin',
      adminOnly: true,
    },
    {
      label: 'Review APIs',
      icon: Box,
      href: '/dashboard/admin/apis/review',
      adminOnly: true,
    },
    {
      label: 'Manage Users',
      icon: Users,
      href: '/dashboard/admin/users',
      adminOnly: true,
    },
    {
      label: 'Manage Organizations',
      icon: Users,
      href: '/dashboard/admin/organizations',
      adminOnly: true,
    },
    {
      label: 'Feature Flags',
      icon: Settings,
      href: '/dashboard/admin/feature-flags',
      adminOnly: true,
    },
    {
      label: 'Implementation Tracker',
      icon: BarChart3,
      href: '/dashboard/admin/tracker',
      adminOnly: true,
    },
    {
      label: 'Security',
      icon: Shield,
      href: '/dashboard/admin/security',
      adminOnly: true,
    },
    {
      label: 'Performance',
      icon: Gauge,
      href: '/dashboard/admin/performance',
      adminOnly: true,
    },
  ];

  const settingItems: CommandItem[] = [
    {
      label: 'Profile Settings',
      icon: User,
      href: '/dashboard/settings/profile',
    },
    {
      label: 'Organization Settings',
      icon: Building2,
      href: '/dashboard/settings/organization',
    },
    {
      label: 'API Keys',
      icon: Key,
      href: '/dashboard/settings/api-keys',
    },
    {
      label: 'Billing',
      icon: CreditCard,
      href: '/dashboard/settings/billing',
    },
    {
      label: 'Notifications',
      icon: Bell,
      href: '/dashboard/settings/notifications',
    },
    {
      label: 'Webhooks',
      icon: Webhook,
      href: '/dashboard/settings/webhooks',
    },
    {
      label: 'Privacy',
      icon: Shield,
      href: '/dashboard/settings/privacy',
    },
    {
      label: 'Security',
      icon: Lock,
      href: '/dashboard/settings/security',
    },
  ];

  const actionItems: CommandItem[] = [
    {
      label: 'Publish New API',
      icon: Plus,
      href: '/dashboard/admin/apis/review',
      providerOnly: true,
    },
    {
      label: 'Browse Marketplace',
      icon: Globe,
      href: '/marketplace',
    },
    {
      label: 'View Documentation',
      icon: FileText,
      href: '/docs',
    },
  ];

  // Filter items based on role
  const filterItems = (items: CommandItem[]) => {
    return items.filter((item) => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.providerOnly && !isProvider) return false;
      if (item.consumerOnly && !isConsumer) return false;
      return true;
    });
  };

  const filteredPageItems = filterItems(pageItems);
  const filteredToolItems = filterItems(toolItems);
  const filteredAdminItems = filterItems(adminItems);
  const filteredActionItems = filterItems(actionItems);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Pages */}
        {filteredPageItems.length > 0 && (
          <CommandGroup heading="Pages">
            {filteredPageItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.label}
                  onSelect={() =>
                    handleSelect(() => {
                      if (item.href) router.push(item.href);
                      if (item.action) item.action();
                    })
                  }
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                  {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Tools */}
        {filteredToolItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tools">
              {filteredToolItems.map((item) => {
                const Icon = item.icon;
                const isLocked = item.planRequired && orgPlan === 'free';
                return (
                  <CommandItem
                    key={item.label}
                    onSelect={() =>
                      handleSelect(() => {
                        if (isLocked) {
                          router.push('/pricing');
                        } else if (item.href) {
                          router.push(item.href);
                        }
                        if (item.action) item.action();
                      })
                    }
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                    {isLocked && (
                      <CommandShortcut className="text-warning">Pro</CommandShortcut>
                    )}
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}

        {/* Admin */}
        {filteredAdminItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Platform Admin">
              {filteredAdminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.label}
                    onSelect={() =>
                      handleSelect(() => {
                        if (item.href) router.push(item.href);
                        if (item.action) item.action();
                      })
                    }
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}

        {/* Settings */}
        <CommandSeparator />
        <CommandGroup heading="Settings">
          {settingItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.label}
                onSelect={() =>
                  handleSelect(() => {
                    if (item.href) router.push(item.href);
                    if (item.action) item.action();
                  })
                }
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {/* Actions */}
        {filteredActionItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              {filteredActionItems.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.label}
                    onSelect={() =>
                      handleSelect(() => {
                        if (item.href) router.push(item.href);
                        if (item.action) item.action();
                      })
                    }
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
