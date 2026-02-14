import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Contact & Support | ${name}`,
    description: `Get in touch with ${name} - support, sales, and general inquiries.`,
  };
}

export default async function ContactPage() {
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
          <h1>Contact & Support</h1>
          <p className="text-lg text-muted-foreground">
            We&apos;re here to help. Choose the right channel for your question.
          </p>

          <div className="not-prose my-8 space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Support</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Technical issues, account help, API questions
              </p>
              <a href="mailto:support@apimarketplace.pro" className="text-primary hover:underline">
                support@apimarketplace.pro
              </a>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Sales & Enterprise</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Enterprise plans, volume pricing, custom agreements
              </p>
              <a href="mailto:sales@apimarketplace.pro" className="text-primary hover:underline">
                sales@apimarketplace.pro
              </a>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">General Inquiries</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Partnerships, press, other questions
              </p>
              <a href="mailto:hello@apimarketplace.pro" className="text-primary hover:underline">
                hello@apimarketplace.pro
              </a>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Documentation</h3>
              <p className="text-sm text-muted-foreground mb-2">API docs, integration guides</p>
              <Link href="/docs" className="text-primary hover:underline">
                Browse Docs
              </Link>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">API Status</h3>
              <p className="text-sm text-muted-foreground mb-2">Check platform availability</p>
              <Link href="/status" className="text-primary hover:underline">
                View Status
              </Link>
            </div>
          </div>

          <h2>Frequently Asked Questions</h2>
          <dl className="space-y-4">
            <div>
              <dt className="font-medium text-foreground">How do I get started as a developer?</dt>
              <dd className="mt-1 text-muted-foreground">
                Sign up at <Link href="/signup">/signup</Link>, browse the marketplace, and
                subscribe to any API. Use the AI Playground after signing in.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">How do I list my API?</dt>
              <dd className="mt-1 text-muted-foreground">
                Create an account, add your organization, and publish your API from the dashboard.
                See our <Link href="/docs">documentation</Link> for the full guide.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">What are your response times?</dt>
              <dd className="mt-1 text-muted-foreground">
                We aim to respond within 24 hours on business days. Enterprise customers receive
                priority support.
              </dd>
            </div>
          </dl>

          <p className="mt-8 text-sm text-muted-foreground">
            © {new Date().getFullYear()} {platformName}. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
