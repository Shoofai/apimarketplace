'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, Settings, LogOut, User, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { useSupabase } from '@/hooks/useSupabase';
import { useRouter } from 'next/navigation';

interface DashboardNavProps {
  user: {
    full_name: string;
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
      <div className="flex h-16 items-center px-4 lg:px-8 gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl flex-shrink-0">
          <span className="text-2xl">🚀</span>
          <span className="hidden sm:inline bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            APIMarketplace Pro
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search APIs, docs..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
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

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline text-sm">{user.full_name.split(' ')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold flex-shrink-0">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{user.full_name}</p>
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
    </header>
  );
}
