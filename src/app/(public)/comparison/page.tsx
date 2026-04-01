import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import Comparison from '@/components/landing/Comparison';
import { Button } from '@/components/ui/button';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `API Marketplace Comparison | ${name}`,
    description: `See how ${name} compares to RapidAPI, Stripe Connect, Postman, and Kong across 10 key features.`,
  };
}

export default async function ComparisonPage() {
  const platformName = await getPlatformName();

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="How We Compare"
        subtitle={`${platformName} vs. RapidAPI, Stripe Connect, Postman, and Kong — side by side across the features that matter.`}
        stats={['10 features', '5 platforms', 'Updated 2026']}
      />

      <div className="container mx-auto px-4 py-4 max-w-4xl text-center">
        <p className="text-muted-foreground">
          {platformName} is the only platform that combines AI code generation, marketplace discovery, payment infrastructure, and enterprise governance in one place.{' '}
          <Link href="/pricing" className="text-primary hover:underline">
            See pricing →
          </Link>
        </p>
      </div>

      {/* Full comparison table — client component with its own padding */}
      <Comparison />

      {/* CTA */}
      <div className="bg-background py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">Ready to make the switch?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Start free in 60 seconds — no credit card required. Migrate from any platform in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/start">Get Started Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/enterprise">Talk to Enterprise Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
