'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trackCTAClick } from '@/lib/analytics';

const pricingTiers = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for individual developers exploring APIs',
    features: [
      { name: 'Up to 10,000 API calls/month', included: true },
      { name: 'Access to 10,000+ APIs', included: true },
      { name: 'AI code generation (10 uses/mo)', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'Community support', included: true },
      { name: 'Advanced analytics', included: false },
      { name: 'Priority support', included: false },
      { name: 'White-label option', included: false },
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: 49,
    description: 'For growing teams and production workloads',
    features: [
      { name: 'Up to 1M API calls/month', included: true },
      { name: 'Unlimited API access', included: true },
      { name: 'Unlimited AI code generation', included: true },
      { name: 'Advanced analytics & insights', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Custom rate limits', included: true },
      { name: 'SSO integration', included: true },
      { name: 'White-label option', included: false },
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: null,
    description: 'For organizations requiring custom solutions',
    features: [
      { name: 'Unlimited API calls', included: true },
      { name: 'Unlimited everything', included: true },
      { name: 'White-label platform', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: '24/7 phone + Slack support', included: true },
      { name: 'Custom SLAs & contracts', included: true },
      { name: 'On-premise deployment option', included: true },
      { name: 'Security & compliance review', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [annual, setAnnual] = useState(false);

  const handlePricingCTA = async (tier: string) => {
    await trackCTAClick({
      cta_type: `pricing_${tier.toLowerCase()}`,
      cta_location: 'pricing_section',
      metadata: { billing_period: annual ? 'annual' : 'monthly' },
    });
  };

  return (
    <section ref={ref} className="bg-gradient-to-br from-gray-50 to-blue-50 py-24 dark:from-gray-950 dark:to-gray-900 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 font-heading text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            Start free, scale as you grow. No hidden fees. Cancel anytime.
          </p>

          {/* Annual Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                annual ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  annual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Annual
              <span className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/50 dark:text-green-300">
                Save 20%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative flex h-full flex-col p-8 ${
                  tier.popular
                    ? 'border-2 border-primary-500 shadow-xl dark:border-primary-400'
                    : 'border border-gray-200 dark:border-gray-800'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                    Most Popular
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <h3 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">{tier.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{tier.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  {tier.price === null ? (
                    <div className="text-4xl font-black text-gray-900 dark:text-white">Custom</div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900 dark:text-white">
                        ${annual ? Math.round(tier.price * 0.8 * 12) : tier.price}
                      </span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        /{annual ? 'year' : 'month'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="h-5 w-5 flex-shrink-0 text-gray-300 dark:text-gray-600" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={tier.popular ? 'gradient' : 'outline'}
                  size="lg"
                  className="w-full"
                  onClick={() => handlePricingCTA(tier.name)}
                >
                  {tier.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All plans include 14-day money-back guarantee. No credit card required for Free tier.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
