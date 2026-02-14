'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, Settings, LogOut, Sparkles, ChevronDown, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { CommandPalette } from '@/components/command-palette';
import { useSupabase } from '@/hooks/useSupabase';
import { useRouter } from 'next/navigation';
import { usePlatformName } from '@/contexts/PlatformNameContext';

interface DashboardNavProps {
  user: {
    full_name?: string | null;
    email: string;
    is_platform_admin?: boolean;
    organizations?: {
      name: string;
      plan: string;
    };
  };
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const supabase = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const platformName = usePlatformName();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">Enterprise</Badge>;
      case 'pro':
        return <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">Pro</Badge>;
      case 'free':
        return <Badge variant="secondary" className="text-xs">Free</Badge>;
      default:
        return null;
    }
  };

  const navUser = {
    is_platform_admin: user.is_platform_admin ?? false,
    organizations: user.organizations
      ? { type: (user.organizations as { type?: string; plan?: string }).type ?? '', plan: user.organizations.plan ?? 'free' }
      : undefined,
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
      <div className="flex h-16 items-center px-4 lg:px-8 gap-4">
        {/* Mobile menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <DashboardSidebar user={navUser} />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl flex-shrink-0">
          <span className="text-2xl">🚀</span>
          <span className="hidden sm:inline bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {platformName}
          </span>
        </Link>

        {/* Left spacer - equal weight with right for true center */}
        <div className="flex-1 min-w-0" aria-hidden />

        {/* Command Palette Trigger - centered */}
        <div className="flex justify-center w-full max-w-md flex-shrink-0">
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="w-full flex items-center gap-2 pl-3 pr-4 py-2 rounded-lg border border-input bg-background text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search APIs, docs...</span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right spacer + actions - equal weight, icons at end */}
        <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
          {/* AI Playground Quick Access */}
          <Link href="/dashboard/playground">
            <Button variant="ghost" size="sm" className="gap-2 hidden md:flex">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI</span>
            </Button>
          </Link>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </Button>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* User / Account Menu */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" className="gap-2 pl-2" aria-label="Account menu" data-testid="account-menu-trigger">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                  {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline text-sm truncate max-w-[120px]">
                  {user.full_name ? user.full_name.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-72 z-[100]">
              <DropdownMenuLabel>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold flex-shrink-0">
                    {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{user.full_name || user.email || 'Account'}</p>
                      {user.is_platform_admin && (
                        <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] px-1.5 py-0">
                          ADMIN
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    {user.organizations && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-xs text-muted-foreground truncate">
                          {user.organizations.name}
                        </p>
                        {getPlanBadge(user.organizations.plan)}
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/docs" className="cursor-pointer">
                  Documentation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/billing" className="cursor-pointer">
                  Billing & Plans
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette user={navUser} />
    </header>
  );
}
