'use client';

import { useState, useEffect, useRef } from 'react';
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
  X,
  Menu,
  ChevronRight,
  ChevronDown,
  Sparkles,
  BarChart3,
  Activity,
  Map,
  ArrowRight,
  Megaphone,
} from 'lucide-react';

// ── Nav groups ────────────────────────────────────────────────────────────────

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Product',
    items: [
      { href: '/marketplace', label: 'Browse APIs', icon: Globe, description: 'Discover 500+ APIs across every category' },
      { href: '/audit', label: 'API Audit', icon: Shield, description: 'Free OpenAPI spec analysis & scoring' },
      { href: '/pricing', label: 'Pricing', icon: CreditCard, description: 'Free, Pro & Enterprise plans' },
    ],
  },
  {
    label: 'Solutions',
    items: [
      { href: '/enterprise', label: 'Enterprise', icon: Building2, description: 'Governance, SSO, SLA & procurement' },
      { href: '/comparison', label: 'Compare', icon: BarChart3, description: 'Side-by-side vs RapidAPI, Postman & more' },
      { href: '/customers', label: 'Customers', icon: Sparkles, description: 'How teams ship faster with us' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { href: '/docs', label: 'Docs', icon: BookOpen, description: 'Quickstart guides & API reference' },
      { href: '/blog', label: 'Blog', icon: FileText, description: 'News, tutorials & product updates' },
      { href: '/roadmap', label: 'Roadmap', icon: Map, description: 'What we\'ve shipped and what\'s next' },
      { href: '/status', label: 'Status', icon: Activity, description: 'Live platform health & uptime' },
    ],
  },
];

// Flat list for mobile menu
const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

// ── Announcement bar ──────────────────────────────────────────────────────────

const ANNOUNCEMENT = {
  id: 'ann-q2-2026',
  text: 'New: AI-powered code generation is now available for all plans.',
  cta: 'Try it free →',
  href: '/signup',
};

function AnnouncementBar({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="relative flex items-center justify-center gap-3 bg-primary px-10 py-2 text-xs font-medium text-primary-foreground">
      <Megaphone className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
      <span className="text-center">
        {ANNOUNCEMENT.text}{' '}
        <Link href={ANNOUNCEMENT.href} className="font-semibold underline underline-offset-2 hover:opacity-80">
          {ANNOUNCEMENT.cta}
        </Link>
      </span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Desktop dropdown ──────────────────────────────────────────────────────────

function NavDropdown({
  group,
  isOpen,
  onMouseEnter,
  onMouseLeave,
  pathname,
}: {
  group: NavGroup;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  pathname: string;
}) {
  const isGroupActive = group.items.some((item) => pathname.startsWith(item.href));

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Trigger */}
      <button
        className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
          isGroupActive
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {group.label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Panel */}
      <div
        className={`absolute left-1/2 top-full z-50 mt-2 w-[320px] -translate-x-1/2 transition-all duration-200 ${
          isOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1 opacity-0'
        }`}
      >
        {/* Arrow */}
        <div className="mx-auto mb-1 h-2 w-4 overflow-hidden">
          <div className="mx-auto h-3 w-3 rotate-45 border-l border-t border-border bg-background" />
        </div>
        <div className="rounded-2xl border border-border bg-background p-2 shadow-xl ring-1 ring-black/5 dark:ring-white/5">
          {group.items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                  isActive
                    ? 'bg-primary/8 text-primary dark:bg-primary/15'
                    : 'hover:bg-accent'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PublicNav() {
  const platformName = usePlatformName();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Announcement — check sessionStorage
  useEffect(() => {
    const dismissed = sessionStorage.getItem(`ann-dismissed-${ANNOUNCEMENT.id}`);
    if (!dismissed) setShowAnnouncement(true);
  }, []);

  const dismissAnnouncement = () => {
    setShowAnnouncement(false);
    sessionStorage.setItem(`ann-dismissed-${ANNOUNCEMENT.id}`, '1');
  };

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Body scroll lock for mobile menu
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  // Dropdown open/close with delay to prevent accidental close
  const openDropdown = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenGroup(label);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenGroup(null), 150);
  };

  return (
    <>
      {/* Announcement bar */}
      {showAnnouncement && <AnnouncementBar onDismiss={dismissAnnouncement} />}

      <nav
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'border-b border-border bg-background/95 shadow-sm backdrop-blur-md'
            : 'border-b border-transparent bg-background/80 backdrop-blur-sm'
        }`}
        aria-label="Main navigation"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="container mx-auto flex min-w-0 items-center justify-between px-4 py-2.5">
          {/* Logo */}
          <Link
            href="/"
            className="flex min-w-0 shrink-0 items-center gap-2"
            aria-label={`${platformName} home`}
          >
            <PlatformLogo height={40} />
          </Link>

          {/* Desktop nav — dropdowns */}
          <div
            className="hidden items-center gap-1 lg:flex"
            onMouseLeave={scheduleClose}
          >
            {NAV_GROUPS.map((group) => (
              <NavDropdown
                key={group.label}
                group={group}
                isOpen={openGroup === group.label}
                onMouseEnter={() => openDropdown(group.label)}
                onMouseLeave={scheduleClose}
                pathname={pathname}
              />
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-2 lg:flex">
            <ThemeSwitcher />
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogIn className="h-3.5 w-3.5" />
              Login
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
              <Link href="/start">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <ThemeSwitcher />
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-accent"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Panel */}
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

        {/* Links by group */}
        <div className="flex-1 px-3 py-4 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon, description }) => {
                  const isActive = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary dark:bg-primary/20'
                          : 'text-foreground hover:bg-accent/50'
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted/70 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-[11px] text-muted-foreground">{description}</p>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isActive ? 'text-primary' : 'text-muted-foreground/40'
                        } group-hover:translate-x-0.5`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA section */}
        <div className="border-t border-border/50 px-5 py-5">
          <Link href="/start" onClick={() => setMobileOpen(false)}>
            <Button className="w-full gap-2 rounded-xl py-6 text-base font-semibold shadow-lg">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
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

          <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2.5">
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
