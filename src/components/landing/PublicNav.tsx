'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { usePlatformName } from '@/contexts/PlatformNameContext';
import PlatformLogo from '@/components/PlatformLogo';
import {
  Globe,
  CreditCard,
  Building2,
  Shield,
  BookOpen,
  FileText,
  LogIn,
  UserPlus,
  Rocket,
  X,
  Menu,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/marketplace', label: 'Browse APIs', icon: Globe, description: 'Discover 500+ APIs' },
  { href: '/pricing', label: 'Pricing', icon: CreditCard, description: 'Free, Pro & Enterprise' },
  { href: '/enterprise', label: 'Enterprise', icon: Building2, description: 'Custom solutions' },
  { href: '/audit', label: 'API Audit', icon: Shield, description: 'Free spec analysis' },
  { href: '/docs', label: 'Docs', icon: BookOpen, description: 'Guides & references' },
  { href: '/blog', label: 'Blog', icon: FileText, description: 'News & tutorials' },
];

export function PublicNav() {
  const platformName = usePlatformName();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm pt-[env(safe-area-inset-top)]"
        aria-label="Main navigation"
      >
        <div className="container mx-auto flex min-w-0 items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex min-w-0 max-w-[55vw] shrink-0 items-center gap-2 font-heading text-lg font-bold tracking-tight"
          >
            <PlatformLogo height={44} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-5 lg:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  pathname === href ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {label}
              </Link>
            ))}
            <ThemeSwitcher />
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
            <Button variant="outline" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button asChild>
              <Link href="/start">Get Started</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-accent"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu — rendered OUTSIDE nav to escape stacking context */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Menu panel */}
      <div
        className={`fixed inset-y-0 right-0 z-[101] flex w-[min(85vw,360px)] flex-col overflow-y-auto bg-background shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <PlatformLogo height={32} />
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Navigation
          </p>
          <div className="space-y-1">
            {NAV_LINKS.map(({ href, label, icon: Icon, description }, i) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-foreground hover:bg-accent/50'
                  }`}
                  style={{ transitionDelay: mobileOpen ? `${i * 40}ms` : '0ms' }}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/70 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{description}</p>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isActive ? 'text-primary' : 'text-muted-foreground/40 group-hover:text-muted-foreground'
                    } group-hover:translate-x-0.5`}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* CTA section */}
        <div className="border-t border-border/50 px-5 py-5">
          <Link href="/start" onClick={() => setMobileOpen(false)}>
            <Button className="w-full gap-2 rounded-xl py-6 text-base font-semibold shadow-lg">
              <Rocket className="h-5 w-5" />
              Get Started Free
            </Button>
          </Link>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button
                variant="ghost"
                className="w-full gap-2 rounded-xl border border-border/50 py-5 text-sm font-medium"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)}>
              <Button
                variant="outline"
                className="w-full gap-2 rounded-xl py-5 text-sm font-medium"
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Theme switcher + bottom badge */}
          <div className="mt-5 flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-medium text-muted-foreground">
                500+ APIs · 11 SDKs
              </span>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </>
  );
}
