'use client';

const faqs = [
  {
    q: 'Can I change plans later?',
    a: 'Yes. You can upgrade or downgrade at any time from your dashboard. Changes take effect at the start of the next billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept major credit and debit cards via Stripe. Enterprise customers can request invoice billing.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'The Free tier is always free. When billing is active, we may offer a trial for Pro—check the signup flow for current offers.',
  },
  {
    q: 'Do you offer annual billing?',
    a: 'When billing is fully active, annual plans will be available with a discount. Contact sales for enterprise annual agreements.',
  },
];

export function PricingFAQ() {
  return (
    <div className="mt-16 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
      <dl className="space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-lg border border-border bg-card [&_summary]:cursor-pointer"
          >
            <summary className="px-4 py-3 font-medium text-foreground list-none flex items-center justify-between">
              {faq.q}
              <span className="text-muted-foreground text-xs">▼</span>
            </summary>
            <dd className="px-4 pb-3 pt-0 text-sm text-muted-foreground border-t border-border mt-0">
              {faq.a}
            </dd>
          </details>
        ))}
      </dl>
    </div>
  );
}
