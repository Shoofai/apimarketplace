import Link from 'next/link';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import { Button } from '@/components/ui/button';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Product Roadmap | ${name}`,
    description: `What we've shipped and what's coming next. ${name} builds in public.`,
  };
}

type RoadmapItem = { label: string; detail?: string };

type Phase = {
  title: string;
  quarter: string;
  color: 'green' | 'amber' | 'gray';
  icon: React.ComponentType<{ className?: string }>;
  items: RoadmapItem[];
};

const phases: Phase[] = [
  {
    title: 'Shipped',
    quarter: 'Q1 2026',
    color: 'green',
    icon: CheckCircle2,
    items: [
      { label: 'API marketplace with discovery and subscriptions' },
      { label: 'AI-powered integration code generation', detail: 'Powered by Anthropic Claude' },
      { label: 'Stripe Connect monetization for API providers' },
      { label: 'OpenAPI → auto-generated documentation' },
      { label: 'Usage-based billing and metering' },
      { label: 'Enterprise ROI calculator and demo booking' },
      { label: 'GDPR-aligned data handling with DPA' },
      { label: 'API Audit Tool (OpenAPI spec analysis)' },
      { label: 'Multi-tenant access control and RBAC' },
      { label: 'Analytics dashboard for providers and enterprises' },
    ],
  },
  {
    title: 'In Progress',
    quarter: 'Q2 2026',
    color: 'amber',
    icon: Clock,
    items: [
      { label: 'SOC 2 Type II audit', detail: 'Third-party audit underway' },
      { label: 'HIPAA Business Associate Agreement (BAA)' },
      { label: 'Enterprise SSO — SAML 2.0 and OIDC' },
      { label: 'Self-hosted deployment option' },
      { label: 'Advanced analytics and custom reporting' },
      { label: 'Community forum and feature voting' },
    ],
  },
  {
    title: 'Planned',
    quarter: 'Q3–Q4 2026',
    color: 'gray',
    icon: Circle,
    items: [
      { label: 'GraphQL gateway support' },
      { label: 'Custom analytics dashboards' },
      { label: '2FA enforcement policies for enterprise orgs' },
      { label: 'White-label marketplace' },
      { label: 'Multi-region failover and data residency' },
      { label: 'iOS and Android SDK' },
      { label: 'Zapier and Make.com integrations' },
      { label: 'Webhook event bus for real-time integrations' },
    ],
  },
];

const dotColors = {
  green: 'bg-green-500',
  amber: 'bg-amber-400',
  gray: 'bg-gray-300 dark:bg-gray-600',
};

const iconColors = {
  green: 'text-green-600 dark:text-green-400',
  amber: 'text-amber-600 dark:text-amber-400',
  gray: 'text-gray-400 dark:text-gray-500',
};

const badgeColors = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default async function RoadmapPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Product Roadmap"
        subtitle="What we've shipped, what's in progress, and what's coming next. We build in public."
        stats={['Building in public', 'Updated Q1 2026']}
      />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Timeline */}
        <ol className="relative border-l border-border space-y-12 pl-8">
          {phases.map(({ title, quarter, color, icon: Icon, items }) => (
            <li key={title} className="relative">
              {/* Dot */}
              <div className={`absolute -left-[1.65rem] top-1 h-4 w-4 rounded-full border-4 border-background ${dotColors[color]}`} />

              {/* Phase header */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Icon className={`h-6 w-6 ${iconColors[color]}`} aria-hidden />
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColors[color]}`}>
                  {quarter}
                </span>
              </div>

              {/* Items */}
              <ul className="space-y-3">
                {items.map(({ label, detail }) => (
                  <li key={label} className="flex items-start gap-3">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColors[color]}`} aria-hidden />
                    <div>
                      <span className="text-sm text-foreground">{label}</span>
                      {detail && (
                        <span className="ml-2 text-xs text-muted-foreground">— {detail}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        {/* Feedback CTA */}
        <div className="mt-16 rounded-xl border border-border bg-muted/30 p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Have a feature request?</h2>
          <p className="text-muted-foreground mb-6">
            Tell us what you need. We prioritize based on customer feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/contact?source=roadmap&category=feature-request">Submit a Request</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/changelog">View Changelog</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
