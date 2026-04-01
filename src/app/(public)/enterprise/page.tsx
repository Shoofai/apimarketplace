import type { Metadata } from 'next';
import { GovernanceFeatureShowcase } from '@/components/growth/GovernanceFeatureShowcase';
import { EnterprisePageClient } from './EnterprisePageClient';
import { EnterpriseFAQ } from './EnterpriseFAQ';

export const metadata: Metadata = {
  title: 'Enterprise API Governance | API Marketplace',
  description:
    'Centralise API discovery, access control, compliance, and cost intelligence for your organisation. Calculate your ROI and book a demo.',
};

export default function EnterprisePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide mb-4">
            Enterprise
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl leading-tight">
            API governance that pays for itself
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Companies using our platform cut API management costs by 60% and eliminate governance
            gaps that expose them to security and compliance risk.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#roi"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
            >
              Calculate my ROI — free
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold hover:bg-muted transition"
            >
              Book a 15-min demo
            </a>
          </div>

          {/* Social proof strip */}
          <div className="mt-12 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card text-center">
            {[
              { value: '60%', label: 'Reduction in management overhead' },
              { value: '$50K+', label: 'Average annual savings per org' },
              { value: '< 1hr', label: 'Time to first governance insight' },
            ].map(({ value, label }) => (
              <div key={value} className="py-5 px-4">
                <p className="text-2xl font-bold text-primary">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Governance features */}
      <GovernanceFeatureShowcase />

      {/* ROI Calculator + Demo scheduling — client island */}
      <EnterprisePageClient />

      {/* Procurement FAQ */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-2">Procurement FAQ</h2>
          <p className="text-muted-foreground mb-6">Common questions from legal and procurement teams.</p>
          <EnterpriseFAQ />
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Ready to govern your APIs?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Join organisations that have eliminated API sprawl, reduced costs, and shipped faster.
          </p>
          <a
            href="/signup?ref=enterprise"
            className="inline-flex items-center gap-2 rounded-xl bg-background text-foreground px-6 py-3 text-sm font-semibold hover:bg-muted transition"
          >
            Start free trial — no credit card
          </a>
        </div>
      </section>
    </main>
  );
}
