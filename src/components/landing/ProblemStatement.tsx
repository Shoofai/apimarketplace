'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const problems = [
  {
    audience: 'API Providers',
    icon: '🏢',
    pain: 'Building payment infrastructure, docs, billing, and analytics takes 6+ months. Most APIs never reach 1000 users.',
    solution:
      'Launch in 1 day. AI-generated docs. Automated billing. Reach 100K+ developers instantly.',
  },
  {
    audience: 'Developers',
    icon: '👨‍💻',
    pain: 'Testing 10 different payment APIs takes 3 days. Switching providers requires rewriting code. Hidden costs eat budgets.',
    solution:
      'AI generates working code in 2 minutes. Switch providers with zero code changes. Auto-optimize costs.',
  },
  {
    audience: 'Enterprises',
    icon: '🏛️',
    pain: 'Shadow IT APIs everywhere. No visibility into $2M+ annual API spend. Security nightmares. Compliance hell.',
    solution:
      'Complete catalog. Policy enforcement. Cost optimization. Security scanning. One platform.',
  },
];

export default function ProblemStatement() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

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
            One Platform. Three Audiences. Infinite Value.
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            Traditional API platforms force you to choose: provider or consumer. We serve{' '}
            <span className="font-semibold text-primary-600">everyone</span>.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {problems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ delay: index * 0.2 }}
              className="group rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 transition-all hover:border-primary-300 hover:shadow-xl dark:border-gray-800 dark:from-gray-900 dark:to-gray-800 dark:hover:border-primary-600"
            >
              <div className="mb-4 text-5xl">{item.icon}</div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">{item.audience}</h3>

              {/* Pain */}
              <div className="mb-6">
                <p className="mb-2 text-sm font-semibold text-red-600 dark:text-red-400">😫 The Pain</p>
                <p className="text-gray-700 dark:text-gray-300">{item.pain}</p>
              </div>

              {/* Solution */}
              <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                <p className="mb-2 text-sm font-semibold text-green-600 dark:text-green-400">✨ The Solution</p>
                <p className="font-medium text-gray-900 dark:text-white">{item.solution}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
