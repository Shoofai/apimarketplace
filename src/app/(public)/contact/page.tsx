import { Suspense } from 'react';
import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import { ContactButton } from '@/components/contact/ContactButton';
import { ContactQuiz } from './ContactQuiz';

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
      <PageHero
        title="Contact & Support"
        subtitle="We're here to help. Choose the right channel or send us a message."
      />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 rounded-lg border border-border bg-muted/30 p-6">
          <p className="text-center text-muted-foreground mb-4">
            We typically respond within 24 hours on business days. Enterprise customers receive priority support.
          </p>
          <p className="text-center text-sm font-medium text-foreground mb-2">Support SLA by tier</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span><strong className="text-foreground">Free:</strong> 48 hours</span>
            <span><strong className="text-foreground">Pro:</strong> 24 hours</span>
            <span><strong className="text-foreground">Enterprise:</strong> 4 hours</span>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Remote-first team · Worldwide coverage
          </p>
        </div>

        <Suspense fallback={<div className="min-h-[320px] animate-pulse rounded-xl bg-muted" />}>
          <ContactQuiz />
        </Suspense>

        <div className="prose prose-slate dark:prose-invert max-w-none mt-12">
          <h2>Other ways to reach us</h2>
          <div className="not-prose my-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Support</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Technical issues, account help, API questions
              </p>
              <ContactButton source="contact-page" category="support">Contact Support</ContactButton>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Sales & Enterprise</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Enterprise plans, volume pricing, custom agreements, SLAs
              </p>
              <ContactButton source="contact-page" category="sales">Contact Sales</ContactButton>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">General Inquiries</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Partnerships, press, other questions
              </p>
              <ContactButton source="contact-page" category="general">Contact Us</ContactButton>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Partner Inquiries</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Integration partnerships, reseller programs, co-marketing
              </p>
              <ContactButton source="contact-page" category="partners">Contact Partners</ContactButton>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Media & Press</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Press inquiries, media kit, interviews
              </p>
              <ContactButton source="contact-page" category="press">Contact Press</ContactButton>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Careers</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Join our team
              </p>
              <ContactButton source="contact-page" category="careers">Contact Careers</ContactButton>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 sm:col-span-2">
              <h3 className="font-semibold text-foreground">Documentation & Resources</h3>
              <p className="text-sm text-muted-foreground mb-3">
                API docs, integration guides, status page
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/docs" className="text-primary hover:underline">
                  Browse Docs
                </Link>
                <Link href="/status" className="text-primary hover:underline">
                  API Status
                </Link>
                <Link href="/security" className="text-primary hover:underline">
                  Security & Compliance
                </Link>
                <Link href="/directory" className="text-primary hover:underline">
                  API Directory
                </Link>
              </div>
            </div>
          </div>

          <h2>Community & Feedback</h2>
          <p className="text-muted-foreground">
            Connect with other developers and share feedback. We&apos;re building in public.
          </p>
          <ul>
            <li><strong>Feature requests:</strong> Submit via the contact quiz above with &quot;Feature Request&quot; in your message</li>
            <li><strong>GitHub:</strong> <a href="#github" className="text-primary hover:underline">github.com</a> (coming soon)</li>
            <li><strong>Discord:</strong> <a href="#discord" className="text-primary hover:underline">Join our server</a> (coming soon)</li>
          </ul>

          <h2>Frequently Asked Questions</h2>

          <h3>Getting Started</h3>
          <dl className="space-y-4">
            <div>
              <dt className="font-medium text-foreground">How do I get started as a developer?</dt>
              <dd className="mt-1 text-muted-foreground">
                Sign up at <Link href="/signup">/signup</Link>, browse the marketplace, and subscribe to any API.
                Use the AI Playground after signing in to generate integration code.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">How do I list my API?</dt>
              <dd className="mt-1 text-muted-foreground">
                Create an account, add your organization, and publish your API from the dashboard.
                See our <Link href="/docs">documentation</Link> for the full guide. You can connect
                Stripe for payouts.
              </dd>
            </div>
          </dl>

          <h3>Billing & Account</h3>
          <dl className="space-y-4">
            <div>
              <dt className="font-medium text-foreground">How does billing work?</dt>
              <dd className="mt-1 text-muted-foreground">
                Subscriptions are billed monthly. Usage-based charges may apply beyond plan limits.
                Payments are processed via Stripe. See our <Link href="/pricing">Pricing</Link> page
                and <Link href="/legal/terms">Terms of Service</Link> for details.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">How do I cancel or change my plan?</dt>
              <dd className="mt-1 text-muted-foreground">
                Manage your subscription from the dashboard under Settings. Cancellation takes effect
                at the end of the billing period. No refunds for partial periods.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Can I get a refund?</dt>
              <dd className="mt-1 text-muted-foreground">
                Refunds are not provided for partial periods or unused quota unless otherwise agreed
                or required by law. <ContactButton source="contact-page" category="support" variant="link" size="default" className="h-auto p-0 inline">Contact support</ContactButton> for billing disputes.
              </dd>
            </div>
          </dl>

          <h3>Technical</h3>
          <dl className="space-y-4">
            <div>
              <dt className="font-medium text-foreground">Do you have webhooks or Zapier integration?</dt>
              <dd className="mt-1 text-muted-foreground">
                Webhook support is on our roadmap. Individual APIs may offer their own webhooks.
                <ContactButton source="contact-page" category="sales" variant="link" size="default" className="h-auto p-0 inline">Contact sales</ContactButton> for Enterprise integration requirements.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">My API key was compromised. What should I do?</dt>
              <dd className="mt-1 text-muted-foreground">
                Rotate your API key immediately from the dashboard. If you need assistance,{' '}
                <ContactButton source="contact-page" category="security" variant="link" size="default" className="h-auto p-0 inline">contact security</ContactButton>.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Where can I check platform status?</dt>
              <dd className="mt-1 text-muted-foreground">
                Our <Link href="/status">Status Page</Link> shows real-time health of platform services.
              </dd>
            </div>
          </dl>

          <h3>Support</h3>
          <dl className="space-y-4">
            <div>
              <dt className="font-medium text-foreground">What are your response times?</dt>
              <dd className="mt-1 text-muted-foreground">
                Free tier: within 48 hours. Pro: within 24 hours. Enterprise: within 4 hours. All
                times are business days (Mon–Fri, excluding holidays).
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Do you offer dedicated support?</dt>
              <dd className="mt-1 text-muted-foreground">
                Enterprise plans include priority support and optional dedicated support.{' '}
                <ContactButton source="contact-page" category="sales" variant="link" size="default" className="h-auto p-0 inline">Contact sales</ContactButton> for details.
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
