'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Box,
  BarChart3,
  Zap,
  Users,
  Settings,
  Crown,
  Globe,
  Layers,
  Database,
  Sparkles,
  TrendingDown,
  FolderOpen,
  Trophy,
  MessageSquare,
  Gauge,
  Palette,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Plug,
  Package,
  Coins,
  UserPlus,
  Paintbrush,
  ChevronDown,
  Heart,
  TestTube2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardSidebarProps {
  user: {
    is_platform_admin: boolean;
    full_name?: string | null;
    email?: string | null;
    organizations?: {
      name?: string | null;
      type: string;
      plan: string;
    };
  };
  /** When true (e.g. in mobile sheet), sidebar is always expanded and has no collapse toggle */
  forceExpanded?: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  providerOnly?: boolean;
  consumerOnly?: boolean;
  comingSoon?: boolean;
}

interface NavSection {
  key: string;
  label: string;
  items: NavItem[];
}

interface AdminGroup {
  key: string;
  label: string;
  items: NavItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'dashboard-sidebar-collapsed';
const ADMIN_GROUPS_KEY = 'dashboard-admin-groups-collapsed';

const PLAN_BADGE: Record<string, { label: string; className: string }> = {
  enterprise: {
    label: 'Enterprise',
    className: 'bg-primary/10 text-primary border-primary/30',
  },
  pro: {
    label: 'Pro',
    className: 'bg-violet-500/10 text-violet-600 border-violet-500/30 dark:text-violet-400',
  },
  free: {
    label: 'Free',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({
  item,
  isActive,
  isCollapsed,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  const link = (
    <Link
      href={item.comingSoon ? '#' : item.href}
      aria-current={isActive ? 'page' : undefined}
      onClick={(e) => item.comingSoon && e.preventDefault()}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150',
        isCollapsed && 'justify-center px-2',
        isActive
          ? 'border-l-2 border-primary bg-primary/10 text-primary font-semibold'
          : 'border-l-2 border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground font-medium',
        item.comingSoon && 'opacity-50 cursor-not-allowed'
      )}
    >
      <item.icon
        className={cn(
          'h-4 w-4 shrink-0',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
        )}
      />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
              {item.badge}
            </Badge>
          )}
          {item.comingSoon && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
              Soon
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  if (!isCollapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" className="font-medium">
        {item.title}
        {item.badge && <span className="ml-1 opacity-60">({item.badge})</span>}
        {item.comingSoon && <span className="ml-1 opacity-60">(Soon)</span>}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── AdminGroup ───────────────────────────────────────────────────────────────

function AdminGroupSection({
  group,
  isCollapsed,
  isExpanded,
  onToggle,
  pathname,
  allAdminItems,
}: {
  group: AdminGroup;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  pathname: string;
  allAdminItems: NavItem[];
}) {
  const activeInGroup = group.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  if (isCollapsed) {
    return (
      <div className="space-y-0.5">
        {group.items.map((item) => {
          const matches = pathname === item.href || pathname.startsWith(item.href + '/');
          const hasDeeperMatch = allAdminItems.some(
            (other) =>
              other.href.length > item.href.length &&
              (pathname === other.href || pathname.startsWith(other.href + '/'))
          );
          return (
            <NavLink
              key={item.href}
              item={item}
              isActive={matches && !hasDeeperMatch}
              isCollapsed
            />
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors',
          activeInGroup
            ? 'text-primary'
            : 'text-muted-foreground/60 hover:text-muted-foreground'
        )}
        aria-expanded={isExpanded}
      >
        <span>{group.label}</span>
        <ChevronDown
          className={cn(
            'h-3 w-3 transition-transform duration-200',
            isExpanded ? 'rotate-0' : '-rotate-90'
          )}
        />
      </button>

      {isExpanded && (
        <div className="space-y-0.5 mt-0.5">
          {group.items.map((item) => {
            const matches = pathname === item.href || pathname.startsWith(item.href + '/');
            const hasDeeperMatch = allAdminItems.some(
              (other) =>
                other.href.length > item.href.length &&
                (pathname === other.href || pathname.startsWith(other.href + '/'))
            );
            return (
              <NavLink
                key={item.href}
                item={item}
                isActive={matches && !hasDeeperMatch}
                isCollapsed={false}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── UserFooter ───────────────────────────────────────────────────────────────

function UserFooter({
  user,
  isCollapsed,
}: {
  user: DashboardSidebarProps['user'];
  isCollapsed: boolean;
}) {
  const displayName = user.full_name || user.email || 'Account';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const plan = user.organizations?.plan ?? 'free';
  const planMeta = PLAN_BADGE[plan] ?? PLAN_BADGE.free;

  const avatar = (
    <Link
      href="/dashboard/settings"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm transition-colors hover:bg-primary/20"
      aria-label="Go to settings"
    >
      {initials}
    </Link>
  );

  if (isCollapsed) {
    return (
      <div className="border-t border-border p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center">{avatar}</div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">{displayName}</p>
            {user.organizations?.name && (
              <p className="text-muted-foreground text-[11px]">{user.organizations.name}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/50 transition-colors">
        {avatar}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate leading-tight">{displayName}</p>
          {user.organizations?.name && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-muted-foreground truncate">
                {user.organizations.name}
              </span>
              <Badge
                variant="outline"
                className={cn('text-[9px] px-1 py-0 h-4 shrink-0 font-medium', planMeta.className)}
              >
                {planMeta.label}
              </Badge>
            </div>
          )}
        </div>
        <Link
          href="/dashboard/settings"
          className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ─── DashboardSidebar ─────────────────────────────────────────────────────────

export default function DashboardSidebar({ user, forceExpanded }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedAdminGroups, setCollapsedAdminGroups] = useState<Set<string>>(new Set());

  const isAdmin = user.is_platform_admin;
  const orgType = user.organizations?.type;
  const orgPlan = user.organizations?.plan ?? 'free';
  const isProvider = orgType === 'provider' || orgType === 'both';
  const isConsumer = orgType === 'consumer' || orgType === 'both';
  const isCollapsed = !forceExpanded && collapsed;

  // Restore sidebar collapse state
  useEffect(() => {
    if (forceExpanded) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setCollapsed(stored === 'true');
  }, [forceExpanded]);

  // Restore admin group collapse state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_GROUPS_KEY);
      if (stored) setCollapsedAdminGroups(new Set(JSON.parse(stored)));
    } catch {
      // ignore
    }
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const toggleAdminGroup = (key: string) => {
    setCollapsedAdminGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      localStorage.setItem(ADMIN_GROUPS_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // ── User nav sections ──────────────────────────────────────────────────────

  const navSections: NavSection[] = [
    {
      key: 'main',
      label: 'Main',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Marketplace', href: '/marketplace', icon: Globe },
        { title: 'Bundles', href: '/marketplace/bundles', icon: Package },
      ],
    },
    {
      key: 'tools',
      label: 'Tools',
      items: [
        { title: 'Discover', href: '/dashboard/discover', icon: Layers, consumerOnly: true },
        { title: 'Provider', href: '/dashboard/provider', icon: Box, providerOnly: true },
        {
          title: 'Developer',
          href: '/dashboard/developer',
          icon: Zap,
          badge: orgPlan === 'free' ? '50/day' : undefined,
          comingSoon: orgPlan === 'free',
        },
        { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      ].filter((item) => {
        if (item.providerOnly && !isProvider) return false;
        if (item.consumerOnly && !isConsumer) return false;
        return true;
      }),
    },
    {
      key: 'community',
      label: 'Community',
      items: [
        { title: 'Forum', href: '/dashboard/forum', icon: MessageSquare },
        { title: 'My Tickets', href: '/dashboard/tickets', icon: Ticket },
      ],
    },
    {
      key: 'account',
      label: 'Account',
      items: [
        { title: 'Credits', href: '/dashboard/credits', icon: Coins },
        { title: 'Settings', href: '/dashboard/settings', icon: Settings },
      ],
    },
  ].filter((section) => section.items.length > 0);

  // ── All user nav items (flattened, for active-detection depth check) ────────
  const allNavItems = navSections.flatMap((s) => s.items);

  // ── Admin groups ───────────────────────────────────────────────────────────

  const adminTopItem: NavItem = {
    title: 'Admin Dashboard',
    href: '/dashboard/admin',
    icon: Crown,
  };

  const adminGroups: AdminGroup[] = [
    {
      key: 'content',
      label: 'Content',
      items: [
        { title: 'APIs', href: '/dashboard/admin/apis', icon: Box },
        { title: 'Bundles', href: '/dashboard/admin/bundles', icon: Package },
        { title: 'Challenges', href: '/dashboard/admin/challenges', icon: Trophy },
        { title: 'Blog Import', href: '/dashboard/admin/blog-import', icon: FolderOpen },
      ],
    },
    {
      key: 'people',
      label: 'People',
      items: [
        { title: 'People', href: '/dashboard/admin/people', icon: Users },
        { title: 'Stakeholders', href: '/dashboard/admin/stakeholders', icon: UserPlus },
      ],
    },
    {
      key: 'platform',
      label: 'Platform',
      items: [
        { title: 'Platform', href: '/dashboard/admin/platform', icon: Palette },
        { title: 'Branding', href: '/dashboard/admin/branding', icon: Paintbrush },
        { title: 'Integrations', href: '/dashboard/admin/integrations', icon: Plug },
      ],
    },
    {
      key: 'operations',
      label: 'Operations',
      items: [
        { title: 'Operations', href: '/dashboard/admin/operations', icon: Gauge },
        { title: 'Dev & Data', href: '/dashboard/admin/dev', icon: Database },
        { title: 'Regression', href: '/dashboard/admin/regression', icon: TestTube2 },
      ],
    },
    {
      key: 'intelligence',
      label: 'Intelligence',
      items: [
        { title: 'AI Monitor', href: '/dashboard/admin/ai', icon: Sparkles },
        { title: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
        { title: 'Churn Risk', href: '/dashboard/admin/churn', icon: TrendingDown },
        { title: 'Growth', href: '/dashboard/growth', icon: BarChart3 },
        { title: 'Nurture', href: '/dashboard/admin/nurture', icon: Heart },
      ],
    },
    {
      key: 'enterprise',
      label: 'Enterprise',
      items: [
        { title: 'Enterprise', href: '/dashboard/admin/enterprise', icon: Crown },
        { title: 'Credits', href: '/dashboard/admin/credits', icon: Coins },
        { title: 'Support', href: '/dashboard/admin/support', icon: Ticket },
      ],
    },
  ];

  const allAdminItems = [adminTopItem, ...adminGroups.flatMap((g) => g.items)];

  // Auto-expand admin groups that contain the active route
  useEffect(() => {
    const activeGroup = adminGroups.find((group) =>
      group.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + '/')
      )
    );
    if (activeGroup) {
      setCollapsedAdminGroups((prev) => {
        if (prev.has(activeGroup.key)) {
          const next = new Set(prev);
          next.delete(activeGroup.key);
          return next;
        }
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <aside
        aria-label="Dashboard navigation"
        className={cn(
          'flex flex-col shrink-0 border-r bg-card/50 backdrop-blur-sm transition-[width] duration-200 ease-in-out',
          'min-h-[calc(100dvh-4rem)]',
          forceExpanded ? 'w-64' : 'hidden lg:flex',
          !forceExpanded && (isCollapsed ? 'lg:w-16' : 'lg:w-64')
        )}
      >
        {/* ── Collapse toggle (top) ─────────────────────────────────────── */}
        {!forceExpanded && (
          <div className={cn(
            'flex shrink-0 border-b border-border/50 p-1.5',
            isCollapsed ? 'justify-center' : 'justify-end'
          )}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggle}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed
                    ? <ChevronRight className="h-4 w-4" />
                    : <ChevronLeft className="h-4 w-4" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Scrollable nav content */}
        <ScrollArea className="flex-1 overflow-hidden">
          <nav className="p-2 space-y-4">
            {/* ── User sections ─────────────────────────────────────────── */}
            {navSections.map((section) => (
              <div key={section.key}>
                {!isCollapsed && (
                  <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {section.label}
                  </p>
                )}
                {isCollapsed && <div className="mb-1 h-px bg-border/40 mx-2" />}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const matches =
                      pathname === item.href || pathname.startsWith(item.href + '/');
                    const hasDeeperMatch = allNavItems.some(
                      (other) =>
                        other.href.length > item.href.length &&
                        (pathname === other.href || pathname.startsWith(other.href + '/'))
                    );
                    return (
                      <NavLink
                        key={item.href}
                        item={item}
                        isActive={matches && !hasDeeperMatch}
                        isCollapsed={isCollapsed}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* ── Admin section ──────────────────────────────────────────── */}
            {isAdmin && (
              <div className="border-t border-border pt-3">
                {/* Admin section header */}
                {!isCollapsed ? (
                  <div className="mb-2 flex items-center gap-1.5 px-3">
                    <Crown className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                      Platform Admin
                    </span>
                  </div>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center mb-2">
                        <Crown className="h-4 w-4 text-primary/60" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">Platform Admin</TooltipContent>
                  </Tooltip>
                )}

                {/* Admin top item: Admin Dashboard */}
                <div className="mb-2 space-y-0.5">
                  <NavLink
                    item={adminTopItem}
                    isActive={
                      pathname === adminTopItem.href ||
                      (pathname.startsWith(adminTopItem.href + '/') &&
                        !allAdminItems
                          .slice(1)
                          .some(
                            (other) =>
                              pathname === other.href ||
                              pathname.startsWith(other.href + '/')
                          ))
                    }
                    isCollapsed={isCollapsed}
                  />
                </div>

                {/* Admin groups */}
                {!isCollapsed ? (
                  <div className="space-y-2">
                    {adminGroups.map((group) => (
                      <AdminGroupSection
                        key={group.key}
                        group={group}
                        isCollapsed={false}
                        isExpanded={!collapsedAdminGroups.has(group.key)}
                        onToggle={() => toggleAdminGroup(group.key)}
                        pathname={pathname}
                        allAdminItems={allAdminItems}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {adminGroups.map((group) => (
                      <AdminGroupSection
                        key={group.key}
                        group={group}
                        isCollapsed
                        isExpanded
                        onToggle={() => {}}
                        pathname={pathname}
                        allAdminItems={allAdminItems}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Upgrade CTA (free users, expanded only) ────────────────── */}
            {orgPlan === 'free' && !isCollapsed && (
              <div className="border-t border-border pt-3 px-1">
                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
                  <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Upgrade to Pro
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Unlock unlimited AI, workflows, and collaboration tools.
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
        </ScrollArea>

        {/* ── User identity footer ──────────────────────────────────────── */}
        <UserFooter user={user} isCollapsed={isCollapsed} />

    </aside>
  );
}
