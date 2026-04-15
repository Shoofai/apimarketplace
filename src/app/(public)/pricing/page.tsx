import { getPlatformName } from '@/lib/settings/platform-name';
import { getFAQsByCategory } from '@/lib/faqs';
import PricingClient from './PricingClient';

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

export default async function PricingPage() {
  const faqs = await getFAQsByCategory('pricing');

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PricingClient faqs={faqs} />
    </>
  );
}
