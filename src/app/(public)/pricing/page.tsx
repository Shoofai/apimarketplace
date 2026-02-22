import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import { PricingFAQ } from './PricingFAQ';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Pricing | ${name}`,
    description: 'Simple, transparent pricing. Start free, scale as you grow.',
  };
}

const tiers = [
  {
    name: 'Free',
    price: 0,
    description: 'For individual developers exploring APIs',
    features: [
      'Up to 10,000 API calls/month',
      'Access to 10,000+ APIs',
      'AI code generation (50/day)',
      'Basic analytics',
      'Community support',
    ],
    cta: 'Start Free',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: 49,
    description: 'For growing teams and production',
    features: [
      'Up to 1M API calls/month',
      'Unlimited API access',
      'Unlimited AI code generation',
      'Advanced analytics',
      'Priority support',
      'Custom rate limits',
      'SSO integration',
      'Workflows & Collaborative Testing',
    ],
    cta: 'Upgrade to Pro',
    href: '/dashboard/settings/billing',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: null,
    description: 'Custom solutions for organizations',
    features: [
      'Unlimited API calls',
      'White-label platform',
      'Dedicated account manager',
      '24/7 support',
      'Custom SLAs',
    ],
    cta: 'Contact Sales',
    href: '/dashboard/settings/billing',
    popular: false,
  },
];

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const billingHref = user ? '/dashboard/settings/billing' : '/signup';

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Simple, Transparent Pricing"
        subtitle="Start free, scale as you grow. No hidden fees."
      />
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col p-8 ${tier.popular ? 'border-2 border-primary shadow-lg' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardContent className="flex flex-1 flex-col pt-6">
                <h2 className="text-2xl font-semibold">{tier.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
                <div className="mt-6">
                  {tier.price === null ? (
                    <span className="text-4xl font-bold">Custom</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={tier.href === '/dashboard/settings/billing' ? billingHref : tier.href} className="mt-8">
                  <Button variant={tier.popular ? 'default' : 'outline'} size="lg" className="w-full">
                    {tier.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          No credit card required for Free tier.
        </p>
        <PricingFAQ />
      </div>
    </div>
  );
}
