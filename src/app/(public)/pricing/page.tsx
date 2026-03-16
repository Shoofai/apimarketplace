import { getPlatformName } from '@/lib/settings/platform-name';
import PricingClient from './PricingClient';

const faqs = [
  { q: 'Can I change plans later?', a: 'Yes. You can upgrade or downgrade at any time from your dashboard. Changes take effect at the start of the next billing period.' },
  { q: 'What payment methods do you accept?', a: 'We accept major credit and debit cards via Stripe. Enterprise customers can request invoice billing.' },
  { q: 'Is there a free trial for Pro?', a: 'The Free tier is always free. When billing is active, we may offer a trial for Pro — check the signup flow for current offers.' },
  { q: 'Do you offer annual billing?', a: 'Yes — toggle annual billing on the pricing page to save 20%. Annual plans billed once per year.' },
];

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Pricing | ${name}`,
    description: 'Simple, transparent pricing. Start free, scale as you grow.',
    openGraph: {
      title: `Pricing | ${name}`,
      description: 'Start free. Upgrade when you need. 14-day money-back guarantee.',
    },
  };
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PricingClient />
    </>
  );
}
