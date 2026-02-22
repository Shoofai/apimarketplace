'use client';

import { motion, useInView } from 'framer-motion';
import { ArrowRight, Building2, Frown, Landmark, Laptop, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

const audienceIcons = {
  'API Providers': Building2,
  Developers: Laptop,
  Enterprises: Landmark,
} as const;

const problems = [
  {
    audience: 'API Providers',
    pain: 'Building payment infrastructure, docs, billing, and analytics takes 6+ months. Most APIs never reach 1000 users.',
    solution:
      'Launch in 1 day. AI-generated docs. Automated billing. Reach 100K+ developers instantly.',
  },
  {
    audience: 'Developers',
    pain: 'Testing 10 different payment APIs takes 3 days. Switching providers requires rewriting code. Hidden costs eat budgets.',
    solution:
      'AI generates working code in 2 minutes. Test any API in the playground before committing. Switch providers with zero code changes. Auto-optimize costs.',
  },
  {
    audience: 'Enterprises',
    pain: 'Shadow IT APIs everywhere. No visibility into $2M+ annual API spend. Security nightmares. Compliance hell.',
    solution:
      'Complete catalog. Policy enforcement. Cost optimization. Security scanning. One platform.',
  },
] as const;

export default function ProblemStatement() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      aria-labelledby="problem-statement-heading"
      className="bg-white py-24 dark:bg-gray-950 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-16 text-center"
        >
          <h2 id="problem-statement-heading" className="section-heading mb-6 text-gray-900 dark:text-white">
            One Platform. Three Audiences. Infinite Value.
          </h2>
          <p className="section-subheading mx-auto max-w-3xl text-gray-600 dark:text-gray-300">
            Traditional API platforms force you to choose: provider or consumer. We serve{' '}
            <span className="font-semibold text-primary-600 dark:text-primary-400">everyone</span>.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {problems.map((item, index) => {
            const Icon = audienceIcons[item.audience];
            return (
              <motion.div
                key={item.audience}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: index * 0.15 }}
                className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 transition-all hover:-translate-y-1 hover:border-primary-300 hover:shadow-2xl focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800 dark:hover:border-primary-600 dark:focus-within:ring-offset-gray-950"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">{item.audience}</h3>

                {/* Pain */}
                <div className="mb-6 flex flex-1 flex-col min-h-0">
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400">
                    <Frown className="h-4 w-4" aria-hidden />
                    The Pain
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">{item.pain}</p>
                </div>

                {/* Solution */}
                <div className="rounded-lg border border-gray-200 bg-primary-50/50 px-4 py-4 dark:border-gray-600 dark:bg-gray-800">
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
                    <Sparkles className="h-4 w-4" aria-hidden />
                    The Solution
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">{item.solution}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA + Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-col items-center gap-3 text-center"
        >
          <Link
            href="/marketplace"
            className="inline-flex items-center font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            See how it works
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Join one platform for APIs and developers.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
