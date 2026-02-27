'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { usePlatformName } from '@/contexts/PlatformNameContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight flex-shrink-0">
          <span className="text-2xl">🚀</span>
          {platformName}
        </Link>

        {/* Desktop: links in row */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks}
          <ThemeSwitcher />
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Login
          </Link>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile: hamburger + sheet */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeSwitcher />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)] overflow-y-auto">
              <div className="flex flex-col gap-6 pt-8">
                <Link
                  href="/marketplace"
                  className="text-base font-medium text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Browse APIs
                </Link>
                <Link
                  href="/pricing"
                  className="text-base font-medium text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/docs"
                  className="text-base font-medium text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Docs
                </Link>
                <div className="border-t pt-4 flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center">
                      Login
                    </Button>
                  </Link>
                  <Button asChild>
                    <Link href="/signup" onClick={() => setMobileOpen(false)} className="w-full text-center">
                      Sign Up
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
