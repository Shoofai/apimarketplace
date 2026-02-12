'use client';

import { ThemeSwitcher } from '@/components/theme-switcher';

export default function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <span className="font-heading text-xl font-bold">APIMarketplace Pro</span>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}
