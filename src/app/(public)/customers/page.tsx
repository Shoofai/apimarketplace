import Link from 'next/link';
import { Quote, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TESTIMONIALS } from '@/lib/testimonials';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Customer Stories | ${name}`,
    description: `See how engineering teams use ${name} to ship faster, cut costs, and grow API revenue.`,
  };
}

const featuredMetrics = [
  { icon: Clock, value: '90%', label: 'Faster integration', color: 'text-primary' },
  { icon: DollarSign, value: '40%', label: 'Cost savings', color: 'text-green-600 dark:text-green-400' },
  { icon: TrendingUp, value: '3×', label: 'Revenue growth', color: 'text-amber-600 dark:text-amber-400' },
];

const platformStats = [
  { value: '500+', label: 'APIs Available' },
  { value: '10K+', label: 'Developers' },
  { value: '99.9%', label: 'Uptime' },
];

export default async function CustomersPage() {
  const platformName = await getPlatformName();
  const [featured, ...rest] = TESTIMONIALS;

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Customer Stories"
        subtitle={`See how engineering teams ship faster and cut costs with ${platformName}.`}
        stats={['500+ APIs', '10K+ Developers', '99.9% Uptime']}
      />

      <main className="container mx-auto px-4 py-12 max-w-5xl space-y-16">
        {/* Featured case study */}
        <section>
          <Card className="overflow-hidden border-primary/20">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-5">
                {/* Story content */}
                <div className="lg:col-span-3 p-8 lg:p-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {featured.initials}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">{featured.name}</span>
                      <span className="text-sm text-muted-foreground"> — {featured.title}, {featured.company}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    From weeks to hours: How {featured.company} cut API integration time by 90%
                  </h2>
                  <Quote className="h-6 w-6 text-muted-foreground/30 mb-2" aria-hidden />
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {featured.quote}
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/contact?source=customers-page&ref=${featured.company.toLowerCase()}`}>
                      Learn how they did it →
                    </Link>
                  </Button>
                </div>

                {/* Metrics */}
                <div className="lg:col-span-2 bg-muted/30 p-8 lg:p-10 flex flex-col justify-center gap-6 border-t lg:border-t-0 lg:border-l border-border">
                  {featuredMetrics.map(({ icon: Icon, value, label, color }) => (
                    <div key={label} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-border shrink-0">
                        <Icon className={`h-5 w-5 ${color}`} aria-hidden />
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${color}`}>{value}</div>
                        <div className="text-sm text-muted-foreground">{label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Testimonial grid */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-8">What Teams Are Saying</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="flex flex-col">
                <CardContent className="pt-6 flex flex-col flex-1">
                  <Quote className="mb-4 h-6 w-6 text-muted-foreground/30" aria-hidden />
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 border-t border-border pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.title}, {t.company}</p>
                    </div>
                    <span className="ml-auto text-xs font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5 shrink-0">
                      {t.metric}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Platform stats */}
        <section className="rounded-xl border border-border bg-muted/30 p-8">
          <div className="grid grid-cols-3 divide-x divide-border text-center">
            {platformStats.map(({ value, label }) => (
              <div key={label} className="px-4">
                <div className="text-3xl font-bold text-primary mb-1">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Share your story CTA */}
        <section className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Using {platformName}?</h2>
          <p className="text-muted-foreground mb-6">
            We&apos;d love to feature your story. Get in touch and share your results.
          </p>
          <Button asChild variant="outline">
            <Link href="/contact?source=customers-page&category=marketing">Share Your Story</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
