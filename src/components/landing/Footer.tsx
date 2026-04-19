'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, Lock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlatformName } from '@/contexts/PlatformNameContext';
import PlatformLogo from '@/components/PlatformLogo';

type FooterLink = { name: string; href: string; locked?: boolean };

const footerColumns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { name: 'Marketplace', href: '/marketplace' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'API Directory', href: '/directory' },
      { name: 'Documentation', href: '/docs' },
      { name: 'Roadmap', href: '/roadmap' },
      { name: 'API Audit Tool', href: '/audit' },
      { name: 'API Status', href: '/status' },
    ],
  },
  {
    title: 'For Developers',
    links: [
      { name: 'Browse APIs', href: '/marketplace' },
      { name: 'Compare APIs', href: '/marketplace/compare' },
      { name: 'AI Playground', href: '/dashboard/developer/playground', locked: true },
      { name: 'Sandbox', href: '/dashboard/developer/sandbox', locked: true },
      { name: 'Collections', href: '/collections' },
      { name: 'Integration Guides', href: '/docs' },
      { name: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'For Providers',
    links: [
      { name: 'List Your API', href: '/signup' },
      { name: 'Monetization', href: '/providers/onboard' },
      { name: 'Provider Resources', href: '/docs' },
      { name: 'Referrals', href: '/dashboard/referrals', locked: true },
      { name: 'Affiliates', href: '/dashboard/affiliates', locked: true },
      { name: 'Enterprise', href: '/enterprise' },
      { name: 'Forum', href: '/dashboard/forum' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Customers', href: '/customers' },
      { name: 'Use Cases', href: '/use-cases' },
      { name: 'Trust Center', href: '/trust-center' },
      { name: 'Help Center', href: '/help' },
      { name: 'Contact & Support', href: '/contact' },
      { name: 'FAQ', href: '/pricing#faq' },
    ],
  },
];

const legalLinks: FooterLink[] = [
  { name: 'Privacy', href: '/legal/privacy' },
  { name: 'Terms', href: '/legal/terms' },
  { name: 'Acceptable Use', href: '/legal/acceptable-use' },
  { name: 'SLA', href: '/legal/sla' },
  { name: 'DPA', href: '/legal/dpa' },
  { name: 'Cookies', href: '/legal/cookies' },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Desktop: always visible */}
      <h3 className="mb-4 hidden text-sm font-semibold uppercase tracking-wider text-gray-900 sm:block dark:text-white">
        {title}
      </h3>
      {/* Mobile: collapsible */}
      <button
        type="button"
        className="flex w-full items-center justify-between py-3 text-sm font-semibold uppercase tracking-wider text-gray-900 sm:hidden dark:text-white"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <ul className={`space-y-3 ${open ? 'block' : 'hidden'} sm:block`}>
        {links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className="inline-flex items-center gap-1.5 text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
            >
              {link.name}
              {link.locked && (
                <Lock
                  className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500"
                  aria-hidden
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const platformName = usePlatformName();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'footer_newsletter' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Subscription failed');
      setMessage({ type: 'success', text: 'Thanks for subscribing.' });
      setEmail('');
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Row 1: Branding + Newsletter */}
        <div className="mb-12 flex flex-col gap-6 border-b border-gray-200 pb-12 dark:border-gray-800 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="flex flex-col gap-2">
            <PlatformLogo height={32} />
            <p className="max-w-md text-gray-600 dark:text-gray-400">
              The AI-powered API marketplace that runs itself. Monetize, discover, and govern APIs at
              scale.
            </p>
          </div>
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex shrink-0 flex-col gap-2 md:max-w-sm md:flex-1"
          >
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                inputMode="email"
                autoComplete="email"
                className="h-10 flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-base text-foreground placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 md:text-sm dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-gray-400"
                required
                disabled={loading}
              />
              <Button type="submit" className="h-10 shrink-0 px-4" disabled={loading}>
                {loading ? 'Subscribing…' : 'Subscribe'}
              </Button>
            </div>
            {message && (
              <p
                className={`text-sm ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                role="status"
              >
                {message.text}
              </p>
            )}
          </form>
        </div>

        {/* Row 2: 4 even link columns */}
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((col) => (
            <FooterColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>

        {/* Row 3: Legal links inline + trust signals */}
        <div className="flex flex-col gap-6 border-t border-gray-200 pt-8 dark:border-gray-800">
          {/* Legal links — horizontal row */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {legalLinks.map((link, i) => (
              <span key={link.name} className="flex items-center gap-4">
                <Link
                  href={link.href}
                  className="text-xs text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-500 dark:hover:text-primary-400"
                >
                  {link.name}
                </Link>
                {i < legalLinks.length - 1 && (
                  <span className="text-gray-300 dark:text-gray-700">·</span>
                )}
              </span>
            ))}
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400">
              SOC 2 (in progress)
            </span>
            <span className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400">
              GDPR Compliant
            </span>
            <span className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400">
              99.9% Uptime SLA
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-600">
              Payments secured &amp; encrypted
            </span>
          </div>

          {/* Copyright + social */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              © {new Date().getFullYear()} {platformName}. All rights reserved.{' '}
              <a
                href="https://www.gradecircle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                A GradeCircle product.
              </a>
            </p>
            <div className="flex gap-4">
              {[
                {
                  icon: Twitter,
                  label: 'Twitter',
                  href: process.env.NEXT_PUBLIC_TWITTER_URL,
                },
                {
                  icon: Github,
                  label: 'GitHub',
                  href: process.env.NEXT_PUBLIC_GITHUB_URL,
                },
                {
                  icon: Linkedin,
                  label: 'LinkedIn',
                  href: process.env.NEXT_PUBLIC_LINKEDIN_URL,
                },
              ].map(({ icon: Icon, label, href }) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 transition-colors hover:text-primary-600 dark:text-gray-500 dark:hover:text-primary-400"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ) : (
                  <span
                    key={label}
                    className="text-gray-300 dark:text-gray-700"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                )
              )}
              <Link
                href="/contact?source=footer&category=general"
                className="text-gray-400 transition-colors hover:text-primary-600 dark:text-gray-500 dark:hover:text-primary-400"
                aria-label="Contact"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
