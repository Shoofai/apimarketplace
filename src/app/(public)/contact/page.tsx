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
                <Link href="/help" className="text-primary hover:underline">
                  Help Center
                </Link>
              </div>
            </div>
          </div>

          <h2 id="community">Community & Feedback</h2>
          <p className="text-muted-foreground">
            Connect with other developers and share feedback. We&apos;re building in public.
          </p>
          <ul>
            <li><strong>Feature requests:</strong> Submit via the contact quiz above with &quot;Feature Request&quot; in your message</li>
            <li><strong>GitHub:</strong> <a href="/contact#community" className="text-primary hover:underline">github.com</a> (coming soon)</li>
            <li><strong>Discord:</strong> <a href="/contact#community" className="text-primary hover:underline">Join our server</a> (coming soon)</li>
          </ul>

          <h2>Frequently Asked Questions</h2>

          <div className="not-prose my-6 rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Looking for answers?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our Help Center has categorized guides for getting started, billing, API integration, security, and troubleshooting.
              </p>
            </div>
            <Link
              href="/help"
              className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse Help Center
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            © {new Date().getFullYear()} {platformName}. All rights reserved.{' '}
            <a
              href="https://www.gradecircle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              A GradeCircle product.
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
