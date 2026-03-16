'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { PricingFAQ } from './PricingFAQ';

const tiers = [
  {
    name: 'Free',
    price: 0,
    description: 'For individual developers exploring APIs',
    features: [
      { name: 'Up to 10,000 API calls/month', included: true },
      { name: 'Access to 10,000+ APIs', included: true },
      { name: 'AI code generation (50/day)', included: true },
      { name: 'Quick API readiness audit', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'Community support', included: true },
      { name: 'Unlimited AI code generation', included: false },
      { name: 'Advanced analytics & insights', included: false },
      { name: 'Priority support', included: false },
      { name: 'Full production readiness audit', included: false },
      { name: 'SSO integration', included: false },
      { name: 'White-label platform', included: false },
    ],
    cta: 'Start Free',
    href: '/signup',
    plan: null,
    popular: false,
  },
  {
    name: 'Pro',
    price: 99,
    description: 'For growing teams and production',
    features: [
      { name: 'Up to 1M API calls/month', included: true },
      { name: 'Unlimited API access', included: true },
      { name: 'Unlimited AI code generation', included: true },
      { name: 'Full production readiness audit', included: true },
      { name: 'Advanced analytics & insights', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Custom rate limits', included: true },
      { name: 'SSO integration', included: true },
      { name: 'Workflows & Collaborative Testing', included: true },
      { name: 'White-label platform', included: false },
      { name: 'Dedicated account manager', included: false },
    ],
    cta: 'Upgrade to Pro',
    href: null,
    plan: 'pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: null,
    description: 'Custom solutions for organizations',
    features: [
      { name: 'Unlimited API calls', included: true },
      { name: 'Unlimited everything', included: true },
      { name: 'Full production readiness audit', included: true },
      { name: 'White-label platform', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: '24/7 phone + Slack support', included: true },
      { name: 'Custom SLAs & contracts', included: true },
      { name: 'On-premise deployment option', included: true },
      { name: 'Security & compliance review', included: true },
      { name: 'Governance, audit logs & cost controls', included: true },
    ],
    cta: 'Contact Sales',
    href: '/enterprise',
    plan: null,
    popular: false,
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleProCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/platform/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });
      if (res.status === 401) {
        router.push('/signup?plan=pro');
        return;
      }
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push('/dashboard/settings/billing');
      }
    } catch {
      router.push('/signup?plan=pro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-primary-100/50 dark:from-gray-900 dark:via-primary-900/20 dark:to-gray-900 py-20 text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Start free, scale as you grow. No hidden fees. Cancel anytime.
        </p>

        {/* Annual toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!annual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              annual ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
            aria-label="Toggle annual billing"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                annual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Annual
            <span className="ml-1.5 rounded-full bg-green-100 dark:bg-green-900/50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:text-green-300">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Tier cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                tier.popular
                  ? 'border-2 border-primary shadow-lg ring-4 ring-primary/10'
                  : 'border border-border'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-6 py-1.5 text-sm font-bold text-primary-foreground shadow">
                  Most Popular
                </div>
              )}

              <div className="mb-4">
                <h2 className="text-2xl font-semibold">{tier.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
              </div>

              <div className="mb-8">
                {tier.price === null ? (
                  <span className="text-4xl font-bold">Custom</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">
                      ${annual ? Math.round(tier.price * 0.8 * 12) : tier.price}
                    </span>
                    <span className="text-muted-foreground">/{annual ? 'year' : 'month'}</span>
                  </div>
                )}
                {annual && tier.price !== null && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    Billed annually — save ${Math.round(tier.price * 0.2 * 12)}/year
                  </p>
                )}
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              {tier.plan === 'pro' ? (
                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={handleProCheckout}
                  disabled={loading}
                >
                  {loading ? 'Loading…' : tier.cta}
                </Button>
              ) : tier.href ? (
                <Link href={tier.href}>
                  <Button
                    variant={tier.popular ? 'default' : 'outline'}
                    size="lg"
                    className="w-full"
                  >
                    {tier.cta}
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="lg" className="w-full" disabled>
                  {tier.cta}
                </Button>
              )}
            </Card>
          ))}
        </div>

        {/* Money-back / no credit card note */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          All paid plans include a 14-day money-back guarantee. No credit card required for Free tier.
        </p>

        {/* Prepaid Credits */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Need flexibility? Use Credits</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-4">
            Buy prepaid credits for pay-as-you-go API usage — no monthly commitment required. Credits can be used to subscribe to individual APIs and are available in your dashboard.
          </p>
          <Link href="/dashboard/credits">
            <Button variant="outline">View Credit Packages</Button>
          </Link>
        </div>

        {/* For API Providers */}
        <div className="mt-10 rounded-2xl border border-border bg-card p-8">
          <h2 className="text-2xl font-semibold mb-2">Publishing an API?</h2>
          <p className="text-muted-foreground max-w-2xl mb-4">
            List your API for free. We charge a <strong>3% platform fee</strong> on revenue billed through the platform when payouts are enabled via Stripe Connect. Set your own pricing plans, usage tiers, and overage rates.
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm mb-6">
            {[
              'Free to list and publish your API',
              'Set your own pricing plans and rate limits',
              'Usage-based billing and overages included',
              'Stripe Connect payouts — get paid in minutes',
              'AI-generated documentation from your OpenAPI spec',
              'Built-in analytics and subscriber management',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="h-4 w-4 shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/providers/onboard">
            <Button>Start Publishing</Button>
          </Link>
        </div>

        {/* Overage note */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Usage beyond your plan&apos;s included calls may incur per-call overage charges as defined by each API&apos;s pricing plan.
        </p>

        <PricingFAQ />
      </div>
    </div>
  );
}
