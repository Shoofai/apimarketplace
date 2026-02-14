import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';
import { Button } from '@/components/ui/button';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `About Us | ${name}`,
    description: `Learn about ${name} - our mission, values, and why we're building the AI-powered API marketplace.`,
  };
}

export default async function AboutPage() {
  const platformName = await getPlatformName();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>About {platformName}</h1>
          <p className="text-xl text-muted-foreground">
            We believe API integration shouldn&apos;t take weeks.
          </p>

          <h2>Our Mission</h2>
          <p>
            {platformName} exists to connect API providers with developers in one place—with
            AI-powered discovery, one-click monetization, and enterprise governance. We want every
            API to be discoverable, every integration to take minutes not days, and every team to
            have full visibility into their API ecosystem.
          </p>

          <h2>Why We Built This</h2>
          <p>
            Traditional API marketplaces force providers to build payment infrastructure, docs, and
            analytics from scratch. Developers waste days testing and integrating APIs. Enterprises
            struggle with shadow IT and fragmented spend. We built a single platform where
            providers monetize in minutes, developers integrate in 2 minutes with AI-generated
            code, and enterprises govern everything with full visibility and compliance.
          </p>

          <h2>Our Values</h2>
          <ul>
            <li>
              <strong>Developer-first:</strong> Every feature is designed to save developers time
              and reduce friction.
            </li>
            <li>
              <strong>Transparent pricing:</strong> No hidden fees. Clear tiers. Usage-based
              billing that scales with you.
            </li>
            <li>
              <strong>AI-powered:</strong> We use AI to generate docs, code, and insights so you
              can focus on building.
            </li>
            <li>
              <strong>Enterprise-ready:</strong> Security, compliance, and governance from day one.
            </li>
          </ul>

          <h2>By the Numbers</h2>
          <p>
            10,000+ APIs listed. 500,000+ active developers. $100M+ in revenue processed through
            our platform. We&apos;re just getting started.
          </p>

          <div className="not-prose mt-12 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
