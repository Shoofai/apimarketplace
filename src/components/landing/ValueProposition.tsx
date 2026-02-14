'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';

const valueProps = {
  providers: {
    title: 'For API Providers',
    subtitle: 'Monetize Faster, Scale Bigger',
    benefits: [
      'One-click Stripe Connect integration - get paid in 5 minutes',
      'AI-generated interactive docs from your OpenAPI spec',
      'Usage-based billing with automatic metering',
      'Built-in rate limiting and analytics dashboard',
      'Reach 500K+ developers instantly without marketing',
    ],
    metrics: ['90% faster time-to-revenue', '10X more API consumers', '$0 infrastructure cost'],
  },
  developers: {
    title: 'For Developers',
    subtitle: 'Ship Faster, Code Smarter',
    benefits: [
      'AI generates working integration code in 2 minutes',
      'Test any API with interactive playground before buying',
      'Switch providers without changing a single line of code',
      'Auto-optimize costs across 10,000+ API alternatives',
      'One authentication flow for all APIs',
    ],
    metrics: ['2 min vs 2 days integration', '75% cost reduction', 'Zero vendor lock-in'],
  },
  enterprises: {
    title: 'For Enterprises',
    subtitle: 'Control Everything, Risk Nothing',
    benefits: [
      'Complete visibility into all API usage across teams',
      'Policy engine enforces security and compliance rules',
      'Cost optimizer saves $500K+ annually on API spend',
      'Built-in SOC2, HIPAA, GDPR compliance scanning',
      'White-label option for internal developer portals',
    ],
    metrics: ['100% API visibility', '60% cost reduction', 'Zero security breaches'],
  },
};

export default function ValueProposition() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeTab, setActiveTab] = useState('providers');

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
            Built for Your Workflow
          </h2>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            The only platform that solves API discovery, integration, monetization, and governance
            in one place.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs
            defaultValue="providers"
            className="w-full"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="mx-auto mb-8 grid w-full max-w-3xl grid-cols-3 p-1">
              <TabsTrigger value="providers" className="text-sm sm:text-base">
                Providers
              </TabsTrigger>
              <TabsTrigger value="developers" className="text-sm sm:text-base">
                Developers
              </TabsTrigger>
              <TabsTrigger value="enterprises" className="text-sm sm:text-base">
                Enterprises
              </TabsTrigger>
            </TabsList>

            {Object.entries(valueProps).map(([key, content]) => (
              <TabsContent key={key} value={key} className="mt-8">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-8 lg:grid-cols-2"
                >
                  {/* Left: Benefits */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg ring-1 ring-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/50">
                    <h3 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{content.title}</h3>
                    <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-300">{content.subtitle}</p>

                    <ul className="space-y-4">
                      {content.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400" />
                          <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: Metrics & Visual */}
                  <div className="flex flex-col gap-6">
                    {/* Metrics */}
                    <div className="grid gap-4">
                      {content.metrics.map((metric, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-accent-50 p-6 text-center dark:border-primary-800 dark:from-primary-950/50 dark:to-accent-950/50"
                        >
                          <p className="text-2xl font-black text-gray-900 dark:text-white">{metric}</p>
                        </div>
                      ))}
                    </div>

                    {/* Code snippet: API integration example */}
                    <div className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-gray-900 p-4 shadow-lg dark:border-gray-700">
                      <div className="mb-3 flex items-center gap-2 border-b border-gray-700 pb-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        <span className="ml-2 text-xs text-gray-500">integration.js</span>
                      </div>
                      <pre className="overflow-x-auto text-sm leading-relaxed text-gray-100">
                        <code>{`// One SDK, any API – generated in 2 min
const client = await apiMarketplace
  .getClient('stripe', 'v1');

const balance = await client
  .get('/v1/balance');

// Usage metered automatically
// Billing handled for you`}</code>
                      </pre>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
