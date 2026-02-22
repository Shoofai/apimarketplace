import Link from 'next/link';
import { Code, DollarSign, Building2, Rocket, Layers, Database, Cpu, Store } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/landing/PageHero';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Use Cases | ${name}`,
    description: `See how ${name} helps API providers monetize, developers integrate faster, and enterprises govern their API ecosystem.`,
  };
}

export default async function UseCasesPage() {
  const platformName = await getPlatformName();

  const useCaseSections = [
    {
      id: 'providers',
      icon: DollarSign,
      title: 'For API Providers',
      tagline: 'Monetize your API in 5 minutes',
      challenge: 'Building payment infrastructure, docs, billing, and analytics takes 6+ months. Most APIs never reach 1,000 users.',
      solution: 'Launch in one day. Connect Stripe once for subscriptions and usage-based billing. AI generates interactive docs from your OpenAPI spec. Get discovered by developers in one marketplace.',
      results: '90% faster time-to-revenue. 10x more API consumers. $0 infrastructure cost.',
      testimonial: '"We went from zero to paying customers in 48 hours. The platform fee is worth every penny."',
      cta: 'List Your API',
      href: '/signup',
    },
    {
      id: 'developers',
      icon: Code,
      title: 'For Developers',
      tagline: 'Integrate any API in 2 minutes',
      challenge: 'Testing 10 different payment APIs takes 3 days. Switching providers requires rewriting code. Hidden costs eat budgets.',
      solution: 'AI generates working integration code in 2 minutes. Test any API in the playground before buying. Switch providers with zero code changes. One auth flow for all APIs.',
      results: '2 min vs 2 days integration. 75% cost reduction. Zero vendor lock-in.',
      testimonial: '"The AI Playground cut our integration time from days to minutes. We shipped our MVP a week early."',
      cta: 'Browse APIs',
      href: '/marketplace',
    },
    {
      id: 'enterprises',
      icon: Building2,
      title: 'For Enterprises',
      tagline: 'Govern your entire API ecosystem',
      challenge: 'Shadow IT APIs everywhere. No visibility into $2M+ annual API spend. Security and compliance challenges.',
      solution: 'Complete visibility into all API usage. Policy engine for security and compliance. Cost optimizer. Built-in SOC2, HIPAA, GDPR scanning. White-label option for internal portals.',
      results: '100% API visibility. 60% cost reduction. Zero security breaches.',
      testimonial: '"We cut our API spend by 60% and finally have a single source of truth for compliance."',
      cta: 'Contact Sales',
      href: '/contact',
    },
    {
      id: 'startups',
      icon: Rocket,
      title: 'For Startups',
      tagline: 'Ship fast with pay-as-you-grow pricing',
      challenge: 'Early-stage budgets can\'t absorb fixed API costs. Long contracts lock you in before product-market fit. You need to iterate fast.',
      solution: 'Free tier to prototype. Usage-based billing scales with you. No long-term contracts. AI-generated code lets you test 5 APIs in an afternoon instead of a week. Switch providers when you find the right fit.',
      results: 'Ship MVP 2x faster. $0 upfront cost. No vendor lock-in before product-market fit.',
      testimonial: '"We tested 8 different APIs in one sprint. Found our winner and integrated in under an hour."',
      cta: 'Get Started Free',
      href: '/signup',
    },
    {
      id: 'agencies',
      icon: Layers,
      title: 'For Agencies',
      tagline: 'Manage multi-client API integrations',
      challenge: 'Each client uses different APIs. Managing keys, billing, and docs across 20+ clients is a nightmare. You need white-label and centralized billing.',
      solution: 'One dashboard for all client projects. Per-project API keys and usage tracking. White-label docs for client-facing documentation. Consolidated billing with usage breakdowns per client.',
      results: '50% less time on API management. Clear cost attribution per client. Professional white-label docs.',
      testimonial: '"We manage 30 client projects from one place. Billing per client is finally straightforward."',
      cta: 'Contact Sales',
      href: '/contact',
    },
    {
      id: 'data-teams',
      icon: Database,
      title: 'For Data Teams',
      tagline: 'Data pipelines and analytics integrations',
      challenge: 'Data pipelines depend on 10+ APIs (CRM, ads, payments, support). Each has different auth, rate limits, and error handling. Syncing and monitoring is a full-time job.',
      solution: 'Unified API access with consistent auth and rate limits. Usage monitoring and alerting. AI-generated ETL code. Pre-built connectors for popular data APIs. One billing view for all data sources.',
      results: '70% less boilerplate. Single dashboard for all data APIs. Predictable costs.',
      testimonial: '"We consolidated 12 data sources into one pipeline. The AI-generated connectors saved us weeks."',
      cta: 'Browse APIs',
      href: '/marketplace',
    },
    {
      id: 'ai-ml',
      icon: Cpu,
      title: 'For AI/ML Applications',
      tagline: 'Model serving and training data APIs',
      challenge: 'Your ML pipeline needs real-time data (weather, market, images). Each provider has different APIs and pricing. Integrating and scaling is complex.',
      solution: 'Discover and subscribe to ML data APIs in one place. Usage-based billing scales with inference volume. AI-generated client code for Python, JS, and more. Rate limits and retries built in.',
      results: 'Faster iteration on ML features. Predictable data costs. Less integration code.',
      testimonial: '"We switched our training data provider in a day. Same interface, different backend."',
      cta: 'Browse APIs',
      href: '/marketplace',
    },
    {
      id: 'industries',
      icon: Store,
      title: 'Industry Solutions',
      tagline: 'Fintech, healthcare, e-commerce, and more',
      challenge: 'Industry-specific APIs (payments, identity, compliance) are fragmented. Each integration requires separate contracts, keys, and support.',
      solution: 'Curated API collections for fintech (payments, KYC, fraud), healthcare (FHIR, identity, compliance), and e-commerce (inventory, shipping, payments). One platform, one contract, one dashboard. Enterprise SLAs and DPAs for regulated industries.',
      results: 'Compliance-ready integrations. 80% faster onboarding. Enterprise support.',
      testimonial: '"We needed HIPAA-compliant APIs. {platformName} had the options and the DPA we needed."',
      cta: 'Explore Directory',
      href: '/directory',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Use Cases"
        subtitle={`Whether you're an API provider, developer, or enterprise, ${platformName} is built for your workflow.`}
      />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="not-prose mb-8 flex flex-wrap gap-2">
            {useCaseSections.map(({ id, title }) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {title.replace('For ', '')}
              </a>
            ))}
          </div>

          <div className="not-prose my-12 space-y-16">
            {useCaseSections.map(({ id, icon: Icon, title, tagline, challenge, solution, results, testimonial, cta, href }) => (
              <section key={id} id={id} className="scroll-mt-24 rounded-2xl border border-border bg-card p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                    <p className="mt-2 text-lg font-medium text-muted-foreground">{tagline}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground">The Challenge</h3>
                    <p className="text-muted-foreground">{challenge}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">The Solution</h3>
                    <p className="text-muted-foreground">
                      {id === 'industries' ? solution.replace('{platformName}', platformName) : solution}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Results</h3>
                    <p className="text-muted-foreground">{results}</p>
                  </div>
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                    {id === 'industries' ? testimonial.replace('{platformName}', platformName) : testimonial}
                  </blockquote>
                </div>
                <Button asChild className="mt-6">
                  <Link href={href}>{cta}</Link>
                </Button>
              </section>
            ))}
          </div>

          <div className="not-prose mt-12 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
