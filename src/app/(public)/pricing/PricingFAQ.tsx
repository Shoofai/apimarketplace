'use client';

import type { FAQ } from '@/lib/faqs';

interface Props {
  faqs: FAQ[];
}

export function PricingFAQ({ faqs }: Props) {
  return (
    <div className="mt-16 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
      <dl className="space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            className="group rounded-lg border border-border bg-card [&_summary]:cursor-pointer"
          >
            <summary className="px-4 py-3 font-medium text-foreground list-none flex items-center justify-between">
              {faq.question}
              <span className="text-muted-foreground text-xs">▼</span>
            </summary>
            <dd className="px-4 pb-3 pt-0 text-sm text-muted-foreground border-t border-border mt-0">
              {faq.answer}
            </dd>
          </details>
        ))}
      </dl>
    </div>
  );
}
