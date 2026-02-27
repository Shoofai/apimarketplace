'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlatformName } from '@/contexts/PlatformNameContext';

const footerLinks = {
  product: [
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'API Directory', href: '/directory' },
    { name: 'Documentation', href: '/docs' },
    { name: 'API Status', href: '/status' },
  ],
  forDevelopers: [
    { name: 'Browse APIs', href: '/marketplace' },
    { name: 'Compare APIs', href: '/marketplace/compare' },
    { name: 'Collections', href: '/collections' },
    { name: 'AI Playground', href: '/login', locked: true },
    { name: 'Sandbox', href: '/login', locked: true },
    { name: 'Integration Guides', href: '/docs' },
  ],
  forProviders: [
    { name: 'List Your API', href: '/signup' },
    { name: 'Monetization', href: '/pricing' },
    { name: 'Referrals', href: '/login', locked: true },
    { name: 'Affiliates', href: '/login', locked: true },
    { name: 'Provider Resources', href: '/docs' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Use Cases', href: '/use-cases' },
    { name: 'Contact & Support', href: '/contact' },
  ],
  resources: [
    { name: 'Help Center', href: '/docs' },
    { name: 'Security & Compliance', href: '/security' },
    { name: 'API Directory', href: '/directory' },
    { name: 'Challenges', href: '/login', locked: true },
    { name: 'Forum', href: '/login', locked: true },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/legal/privacy' },
    { name: 'Terms of Service', href: '/legal/terms' },
    { name: 'Acceptable Use', href: '/legal/acceptable-use' },
    { name: 'Service Level Agreement', href: '/legal/sla' },
    { name: 'Data Processing Agreement', href: '/legal/dpa' },
    { name: 'Cookie Policy', href: '/legal/cookies' },
    { name: 'Cookie Settings', href: '/legal/cookie-settings' },
  ],
};

export default function Footer() {
  const platformName = usePlatformName();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        {/* Row 1: Branding + Newsletter (full width) */}
        <div className="mb-12 flex flex-col gap-6 border-b border-gray-200 pb-12 dark:border-gray-800 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span className="font-heading text-xl font-bold tracking-tight text-gray-900 dark:text-white">{platformName}</span>
            </div>
            <p className="max-w-md text-gray-600 dark:text-gray-400">
              The AI-powered API marketplace that runs itself. Monetize, discover, and govern APIs
              at scale.
            </p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="flex shrink-0 flex-col gap-2 md:max-w-sm md:flex-1">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                inputMode="email"
                autoComplete="email"
                className="h-10 flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-base md:text-sm text-foreground placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-gray-400"
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

        {/* Row 2: Link columns (6 columns on lg) */}
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Developers */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              For Developers
            </h3>
            <ul className="space-y-3">
              {footerLinks.forDevelopers.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    {link.name}
                    {'locked' in link && link.locked && (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              For Providers
            </h3>
            <ul className="space-y-3">
              {footerLinks.forProviders.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    {link.name}
                    {'locked' in link && link.locked && (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    {link.name}
                    {'locked' in link && link.locked && (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 border-t border-gray-200 py-6 dark:border-gray-800">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            One platform for API discovery, integration, and monetization
          </span>
          <span className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            SOC 2 Ready
          </span>
          <span className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            GDPR Compliant
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Payments powered by Stripe
          </span>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 dark:border-gray-800 sm:flex-row">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} {platformName}. All rights reserved.
          </p>

          {/* Social Icons - use NEXT_PUBLIC_TWITTER_URL, NEXT_PUBLIC_GITHUB_URL, NEXT_PUBLIC_LINKEDIN_URL when configured */}
          <div className="flex gap-4">
            {process.env.NEXT_PUBLIC_TWITTER_URL ? (
              <a
                href={process.env.NEXT_PUBLIC_TWITTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            ) : (
              <span className="text-gray-400 dark:text-gray-500" aria-hidden>
                <Twitter className="h-5 w-5" />
              </span>
            )}
            {process.env.NEXT_PUBLIC_GITHUB_URL ? (
              <a
                href={process.env.NEXT_PUBLIC_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            ) : (
              <span className="text-gray-400 dark:text-gray-500" aria-hidden>
                <Github className="h-5 w-5" />
              </span>
            )}
            {process.env.NEXT_PUBLIC_LINKEDIN_URL ? (
              <a
                href={process.env.NEXT_PUBLIC_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            ) : (
              <span className="text-gray-400 dark:text-gray-500" aria-hidden>
                <Linkedin className="h-5 w-5" />
              </span>
            )}
            <Link
              href="/contact?source=footer&category=general"
              className="text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              aria-label="Contact"
            >
              <Mail className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
