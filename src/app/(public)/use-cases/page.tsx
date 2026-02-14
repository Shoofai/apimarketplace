import Link from 'next/link';
import { ArrowLeft, Code, DollarSign, Building2 } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';
import { Button } from '@/components/ui/button';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Use Cases | ${name}`,
    description: `See how ${name} helps API providers monetize, developers integrate faster, and enterprises govern their API ecosystem.`,
  };
}

export default async function UseCasesPage() {
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
          <h1>Use Cases</h1>
          <p className="text-xl text-muted-foreground">
            Whether you&apos;re an API provider, developer, or enterprise, {platformName} is built
            for your workflow.
          </p>

          <div className="not-prose my-12 space-y-16">
            <section className="rounded-2xl border border-border bg-card p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">For API Providers</h2>
                  <p className="mt-2 text-lg font-medium text-muted-foreground">
                    Monetize your API in 5 minutes
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">The Challenge</h3>
                  <p className="text-muted-foreground">
                    Building payment infrastructure, docs, billing, and analytics takes 6+ months.
                    Most APIs never reach 1,000 users.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">The Solution</h3>
                  <p className="text-muted-foreground">
                    Launch in one day. Connect Stripe once for subscriptions and usage-based
                    billing. AI generates interactive docs from your OpenAPI spec. Reach 500K+
                    developers instantly.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Results</h3>
                  <p className="text-muted-foreground">
                    90% faster time-to-revenue. 10x more API consumers. $0 infrastructure cost.
                  </p>
                </div>
              </div>
              <Button asChild className="mt-6">
                <Link href="/signup">List Your API</Link>
              </Button>
            </section>

            <section className="rounded-2xl border border-border bg-card p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Code className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">For Developers</h2>
                  <p className="mt-2 text-lg font-medium text-muted-foreground">
                    Integrate any API in 2 minutes
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">The Challenge</h3>
                  <p className="text-muted-foreground">
                    Testing 10 different payment APIs takes 3 days. Switching providers requires
                    rewriting code. Hidden costs eat budgets.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">The Solution</h3>
                  <p className="text-muted-foreground">
                    AI generates working integration code in 2 minutes. Test any API in the
                    playground before buying. Switch providers with zero code changes. One auth
                    flow for all APIs.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Results</h3>
                  <p className="text-muted-foreground">
                    2 min vs 2 days integration. 75% cost reduction. Zero vendor lock-in.
                  </p>
                </div>
              </div>
              <Button asChild className="mt-6">
                <Link href="/marketplace">Browse APIs</Link>
              </Button>
            </section>

            <section className="rounded-2xl border border-border bg-card p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">For Enterprises</h2>
                  <p className="mt-2 text-lg font-medium text-muted-foreground">
                    Govern your entire API ecosystem
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">The Challenge</h3>
                  <p className="text-muted-foreground">
                    Shadow IT APIs everywhere. No visibility into $2M+ annual API spend. Security
                    and compliance challenges.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">The Solution</h3>
                  <p className="text-muted-foreground">
                    Complete visibility into all API usage. Policy engine for security and
                    compliance. Cost optimizer. Built-in SOC2, HIPAA, GDPR scanning. White-label
                    option for internal portals.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Results</h3>
                  <p className="text-muted-foreground">
                    100% API visibility. 60% cost reduction. Zero security breaches.
                  </p>
                </div>
              </div>
              <Button asChild className="mt-6">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </section>
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
