'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { usePlatformName } from '@/contexts/PlatformNameContext';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Menu } from 'lucide-react';

export function PublicNav() {
  const platformName = usePlatformName();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (
    <>
      <Link href="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-foreground">
        Browse APIs
      </Link>
      <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
        Pricing
      </Link>
      <Link href="/enterprise" className="text-sm font-medium text-muted-foreground hover:text-foreground">
        Enterprise
      </Link>
      <Link href="/audit" className="text-sm font-medium text-muted-foreground hover:text-foreground">
        API Audit
      </Link>
      <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground">
        Docs
      </Link>
    </>
  );

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm pt-[env(safe-area-inset-top)]"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center min-w-0">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight shrink-0 min-w-0 max-w-[55vw]">
          <span className="text-2xl leading-none shrink-0">🚀</span>
          <span className="truncate">{platformName}</span>
        </Link>

        {/* Desktop: links in row */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks}
          <ThemeSwitcher />
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Login
          </Link>
          <Button variant="outline" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button asChild>
            <Link href="/start">Get Started</Link>
          </Button>
        </div>

        {/* Mobile: hamburger + sheet */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
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
                {[
                  { href: '/marketplace', label: 'Browse APIs' },
                  { href: '/pricing', label: 'Pricing' },
                  { href: '/enterprise', label: 'Enterprise' },
                  { href: '/audit', label: 'API Audit' },
                  { href: '/docs', label: 'Docs' },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center min-h-[44px] px-2 text-base font-medium text-foreground rounded-md hover:bg-accent transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <div className="border-t mt-4 pt-4 flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center">
                      Login
                    </Button>
                  </Link>
                  <Button variant="outline" asChild>
                    <Link href="/signup" onClick={() => setMobileOpen(false)} className="w-full text-center">
                      Sign Up
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/start" onClick={() => setMobileOpen(false)} className="w-full text-center">
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
