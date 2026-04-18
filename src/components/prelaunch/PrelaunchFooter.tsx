import Link from 'next/link';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';
import PlatformLogo from '@/components/PlatformLogo';

const PAGE_LINKS = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Cookie Policy', href: '/legal/cookies' },
  { label: 'Acceptable Use', href: '/legal/acceptable-use' },
];

const SOCIAL = [
  { label: 'Twitter / X', icon: Twitter, env: process.env.NEXT_PUBLIC_TWITTER_URL },
  { label: 'GitHub', icon: Github, env: process.env.NEXT_PUBLIC_GITHUB_URL },
  { label: 'LinkedIn', icon: Linkedin, env: process.env.NEXT_PUBLIC_LINKEDIN_URL },
];

export function PrelaunchFooter({ platformName }: { platformName: string }) {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-6">
        {/* Top: branding + nav + social */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <PlatformLogo height={28} />
            <span className="text-muted-foreground text-xs hidden sm:inline">· Coming soon</span>
          </div>

          {/* Page nav */}
          <nav className="flex flex-wrap items-center text-sm text-muted-foreground">
            {PAGE_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className="px-3 py-1 hover:text-foreground transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          {/* Social icons */}
          <div className="flex items-center gap-3 shrink-0">
            {SOCIAL.map(({ label, icon: Icon, env }) =>
              env ? (
                <a
                  key={label}
                  href={env}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ) : null
            )}
            <Link
              href="/contact"
              aria-label="Email us"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Bottom: copyright + legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {platformName}. All rights reserved.
          </p>
          <nav className="flex flex-wrap items-center justify-center text-xs text-muted-foreground">
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className="px-3 py-1 hover:text-foreground transition-colors">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
