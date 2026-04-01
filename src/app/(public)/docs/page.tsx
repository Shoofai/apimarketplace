import Link from 'next/link';
import { BookOpen, ArrowRight, Terminal, ExternalLink } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Developer Documentation | ${name}`,
    description: `Everything you need to integrate APIs in minutes. SDKs, guides, and API reference for ${name}.`,
  };
}

const quickStart = [
  {
    step: 1,
    title: 'Get Your API Key',
    description: 'Create a free account and generate your API key from the dashboard in under a minute.',
    cta: { label: 'Create Account', href: '/signup' },
  },
  {
    step: 2,
    title: 'Make Your First Call',
    description: 'Browse 500+ APIs in the marketplace, pick one, and use AI-generated code to integrate instantly.',
    cta: { label: 'Browse APIs', href: '/marketplace' },
  },
  {
    step: 3,
    title: 'Go to Production',
    description: 'Set rate limits, configure webhooks, monitor usage, and scale with enterprise governance.',
    cta: { label: 'Enterprise Features', href: '/enterprise' },
  },
];

const sdks = [
  { name: 'Node.js', install: 'npm install @apimarketplace/sdk', lang: 'JS' },
  { name: 'Python', install: 'pip install apimarketplace', lang: 'PY' },
  { name: 'Go', install: 'go get github.com/apimarketplace/go-sdk', lang: 'GO' },
  { name: 'Ruby', install: 'gem install apimarketplace', lang: 'RB' },
  { name: 'PHP', install: 'composer require apimarketplace/sdk', lang: 'PHP' },
  { name: 'Java', install: 'implementation "io.apimarketplace:sdk:1.0"', lang: 'JV' },
];

const resources = [
  { name: 'API Reference', description: 'Full REST API reference with examples', href: '/help' },
  { name: 'Integration Guides', description: 'Step-by-step guides for common use cases', href: '/help' },
  { name: 'Code Examples', description: 'Curated collections of ready-to-use examples', href: '/collections' },
  { name: 'Changelog', description: "What's new in the latest platform releases", href: '/changelog' },
  { name: 'Platform Status', description: 'Real-time health and uptime monitoring', href: '/status' },
  { name: 'Community Forum', description: 'Ask questions and share knowledge', href: '/dashboard/forum' },
];

export default async function DocsPage() {
  const platformName = await getPlatformName();

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Developer Documentation"
        subtitle={`Everything you need to integrate APIs in minutes with ${platformName}.`}
        stats={['REST API', '11 SDKs', 'OpenAPI 3.1']}
      />

      <main className="container mx-auto px-4 py-12 max-w-5xl space-y-16">
        {/* Quick Start */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Quick Start</h2>
          <p className="text-muted-foreground mb-8">Get from zero to production in three steps.</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {quickStart.map(({ step, title, description, cta }) => (
              <Card key={step}>
                <CardContent className="pt-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                      {step}
                    </div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1 mb-6">{description}</p>
                  <Button asChild variant="outline" size="sm" className="w-full gap-2">
                    <Link href={cta.href}>
                      {cta.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* SDKs */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Official SDKs</h2>
          <p className="text-muted-foreground mb-8">Drop-in libraries for every major language.</p>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            {sdks.map(({ name, install, lang }) => (
              <Card key={name} className="hover:border-primary/40 transition-colors">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono shrink-0">
                      {lang}
                    </div>
                    <span className="font-semibold text-foreground">{name}</span>
                  </div>
                  <code className="text-xs text-muted-foreground font-mono bg-muted rounded px-2 py-1 block truncate">
                    {install}
                  </code>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Resources</h2>
          <p className="text-muted-foreground mb-8">Everything else you need to build and ship.</p>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            {resources.map(({ name, description, href }) => (
              <Link
                key={name}
                href={href}
                className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-primary" aria-hidden />
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Support CTA */}
        <section className="rounded-xl border border-border bg-muted/30 p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Can&apos;t find what you&apos;re looking for?</h2>
          <p className="text-muted-foreground mb-6">Browse the full help center or reach out to our support team.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/help">Browse Help Center</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
