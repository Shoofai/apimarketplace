'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check, X, Zap } from 'lucide-react';
import { usePlatformName } from '@/contexts/PlatformNameContext';

const competitorList = (platformName: string) => [
  {
    name: platformName,
    logo: '🚀',
    isUs: true,
  },
  {
    name: 'RapidAPI',
    logo: '🔷',
    isUs: false,
  },
  {
    name: 'Stripe Connect',
    logo: '💳',
    isUs: false,
  },
  {
    name: 'Postman',
    logo: '📮',
    isUs: false,
  },
  {
    name: 'Kong',
    logo: '🦍',
    isUs: false,
  },
];

const features = [
  {
    name: 'AI Code Generation',
    apimp: true,
    rapidapi: false,
    stripe: false,
    postman: false,
    kong: false,
  },
  {
    name: 'One-Click Monetization',
    apimp: true,
    rapidapi: true,
    stripe: true,
    postman: false,
    kong: false,
  },
  {
    name: 'Universal API Gateway',
    apimp: true,
    rapidapi: false,
    stripe: false,
    postman: false,
    kong: true,
  },
  {
    name: 'Usage-Based Billing',
    apimp: true,
    rapidapi: true,
    stripe: true,
    postman: false,
    kong: false,
  },
  {
    name: 'Auto-Generated Docs',
    apimp: true,
    rapidapi: false,
    stripe: false,
    postman: true,
    kong: false,
  },
  {
    name: 'Developer Playground',
    apimp: true,
    rapidapi: true,
    stripe: false,
    postman: true,
    kong: false,
  },
  {
    name: 'Cost Optimizer',
    apimp: true,
    rapidapi: false,
    stripe: false,
    postman: false,
    kong: false,
  },
  {
    name: 'Compliance Engine',
    apimp: true,
    rapidapi: false,
    stripe: true,
    postman: false,
    kong: false,
  },
  {
    name: 'White-Label Option',
    apimp: true,
    rapidapi: false,
    stripe: true,
    postman: false,
    kong: true,
  },
  {
    name: 'AI-Powered Search',
    apimp: true,
    rapidapi: false,
    stripe: false,
    postman: false,
    kong: false,
  },
];

export default function Comparison() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const platformName = usePlatformName();
  const competitors = competitorList(platformName);

  return (
    <section ref={ref} className="bg-white py-24 dark:bg-gray-950 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 font-heading text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Why We're Different
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            Others solve one problem. We solve them all. Compare for yourself.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2 }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[800px] border-collapse rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            {/* Header */}
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
                <th className="p-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Feature
                </th>
                {competitors.map((competitor) => (
                  <th key={competitor.name} className={`p-6 text-center ${competitor.isUs ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                    <div
                      className={`flex flex-col items-center ${
                        competitor.isUs ? 'scale-110 rounded-xl border-2 border-primary-500 bg-white p-4 shadow-lg ring-4 ring-primary-500/10 dark:bg-gray-900' : ''
                      }`}
                    >
                      <div className="mb-1 text-3xl">{competitor.logo}</div>
                      <div
                        className={`text-xs font-semibold ${
                          competitor.isUs ? 'text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {competitor.name}
                      </div>
                      {competitor.isUs && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-primary-600">
                          <Zap className="h-3 w-3" />
                          <span>That's us!</span>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={feature.name}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 ${index % 2 === 0 ? 'bg-gray-50/30 dark:bg-gray-900/30' : ''}`}
                >
                  <td className="p-6 text-sm font-medium text-gray-900 dark:text-gray-100">{feature.name}</td>
                  <td className="bg-primary-50/30 p-6 text-center dark:bg-primary-900/10">
                    {feature.apimp ? (
                      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    ) : (
                      <X className="mx-auto h-6 w-6 text-gray-300 dark:text-gray-600" />
                    )}
                  </td>
                  <td className="p-6 text-center">
                    {feature.rapidapi ? (
                      <Check className="mx-auto h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="mx-auto h-6 w-6 text-gray-300 dark:text-gray-600" />
                    )}
                  </td>
                  <td className="p-6 text-center">
                    {feature.stripe ? (
                      <Check className="mx-auto h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="mx-auto h-6 w-6 text-gray-300 dark:text-gray-600" />
                    )}
                  </td>
                  <td className="p-6 text-center">
                    {feature.postman ? (
                      <Check className="mx-auto h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="mx-auto h-6 w-6 text-gray-300 dark:text-gray-600" />
                    )}
                  </td>
                  <td className="p-6 text-center">
                    {feature.kong ? (
                      <Check className="mx-auto h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="mx-auto h-6 w-6 text-gray-300 dark:text-gray-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Callout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 rounded-2xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-accent-50 p-8 text-center dark:border-primary-800 dark:from-primary-950/50 dark:to-accent-950/50"
        >
          <h3 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
            The Only All-in-One Solution
          </h3>
          <p className="mx-auto max-w-2xl leading-relaxed text-gray-700 dark:text-gray-300">
            Stop paying for 5 separate tools. Get discovery, integration, monetization, gateway,
            and analytics in one platform.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
