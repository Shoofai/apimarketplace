import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import { HelpCenterClient } from './HelpCenterClient';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Help Center | ${name}`,
    description: `Find answers to common questions, troubleshoot issues, and get the most out of ${name}.`,
  };
}

export default async function HelpCenterPage() {
  const platformName = await getPlatformName();

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Help Center"
        subtitle={`Answers, guides, and troubleshooting for ${platformName}`}
      />

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <HelpCenterClient />

        {/* Can't find what you need? */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
          <MessageCircle className="h-10 w-10 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Can&apos;t find what you need?</h2>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Our support team is here to help. Describe your issue and we&apos;ll route you to the right person.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
