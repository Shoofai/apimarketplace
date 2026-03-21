'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { usePlatformName } from '@/contexts/PlatformNameContext';
import PlatformLogo from '@/components/PlatformLogo';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Menu } from 'lucide-react';

const NAV_LINKS = [
  { href: '/marketplace', label: 'Browse APIs' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/enterprise', label: 'Enterprise' },
  { href: '/audit', label: 'API Audit' },
  { href: '/docs', label: 'Docs' },
];

export function PublicNav() {
  const platformName = usePlatformName();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm pt-[env(safe-area-inset-top)]"
      aria-label="Main navigation"
    >
      <div className="container mx-auto flex min-w-0 items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex min-w-0 max-w-[55vw] shrink-0 items-center gap-2 font-heading text-lg font-bold tracking-tight"
        >
          <PlatformLogo size={32} showName={false} />
        </Link>

        {/* Desktop nav — lg breakpoint so tablet gets hamburger */}
        <div className="hidden items-center gap-5 lg:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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

        {/* Mobile + tablet hamburger */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <ThemeSwitcher />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw,20rem)] overflow-y-auto">
              <VisuallyHidden>
                <SheetTitle>Navigation menu</SheetTitle>
              </VisuallyHidden>
              <div className="flex flex-col gap-1 pt-8">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex min-h-[44px] items-center rounded-md px-2 text-base font-medium text-foreground transition-colors hover:bg-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-3 border-t pt-4">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center">
                      Login
                    </Button>
                  </Link>
                  <Button variant="outline" asChild>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center"
                    >
                      Sign Up
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link
                      href="/start"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center"
                    >
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
