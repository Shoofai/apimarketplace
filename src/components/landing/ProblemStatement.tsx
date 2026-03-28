'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, Building2, Frown, Landmark, Laptop, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { scaleIn, staggerFast } from '@/lib/animations';

const problems = [
  {
    audience: 'API Providers' as const,
    icon: Building2,
    iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
    accentBorder: 'group-hover:border-purple-300 dark:group-hover:border-purple-600',
    pain: 'Building payment infrastructure, docs, billing, and analytics takes 6+ months. Most APIs never reach 1000 users.',
    solution:
      'Launch in 1 day with AI-generated docs, automated billing, and instant reach to 100K+ developers.',
    stat: { value: '6 mo → 1 day', label: 'Time to market' },
    cta: { label: 'Start publishing', href: '/dashboard/provider' },
  },
  {
    audience: 'Developers' as const,
    icon: Laptop,
    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    accentBorder: 'group-hover:border-blue-300 dark:group-hover:border-blue-600',
    pain: 'Testing 10 different payment APIs takes 3 days. Switching providers requires rewriting code. Hidden costs eat budgets.',
    solution:
      'AI generates working code in 2 minutes — test any API in the playground, switch providers with zero code changes.',
    stat: { value: '3 days → 2 min', label: 'Integration time' },
    cta: { label: 'Try the playground', href: '/dashboard/developer/playground' },
  },
  {
    audience: 'Enterprises' as const,
    icon: Landmark,
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    accentBorder: 'group-hover:border-amber-300 dark:group-hover:border-amber-600',
    pain: 'Shadow IT APIs everywhere. No visibility into $2M+ annual API spend. Security nightmares. Compliance hell.',
    solution:
      'Complete catalog with policy enforcement, cost optimization, and security scanning — one platform for total API governance.',
    stat: { value: '40%', label: 'Avg. cost savings' },
    cta: { label: 'See governance', href: '/dashboard/settings' },
  },
];

function PersonaCard({
  item,
  index,
  isInView,
}: {
  item: (typeof problems)[number];
  index: number;
  isInView: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;

  return (
    <motion.div
      variants={scaleIn}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
      transition={{ delay: index * 0.15 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative flex h-full flex-col overflow-hidden card-elevated p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${item.accentBorder} dark:focus-within:ring-offset-gray-950`}
    >
      {/* Top section — icon + title + pain */}
      <div className="flex flex-1 flex-col p-8 pb-0">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg}`}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          {item.audience}
        </h3>

        {/* Pain — fades slightly on hover */}
        <motion.div
          animate={{ opacity: hovered ? 0.5 : 1 }}
          transition={{ duration: 0.2 }}
          className="mb-4 min-h-0 flex-1"
        >
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400">
            <Frown className="h-4 w-4" aria-hidden />
            The Pain
          </p>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{item.pain}</p>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="mx-8 border-t border-dashed border-gray-200 dark:border-gray-700" />

      {/* Solution — expands on hover */}
      <motion.div
        animate={{
          backgroundColor: hovered ? 'rgba(124, 79, 242, 0.05)' : 'rgba(0, 0, 0, 0)',
        }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-3 p-8 pt-4"
      >
        <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
          <Sparkles className="h-4 w-4" aria-hidden />
          The Solution
        </p>
        <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-white">
          {item.solution}
        </p>

        {/* Stat badge — slides in on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-900/30"
            >
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden />
              <span className="text-sm font-bold text-green-700 dark:text-green-300">
                {item.stat.value}
              </span>
              <span className="text-xs text-green-600 dark:text-green-400">{item.stat.label}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Per-card CTA — slides in on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              <Link
                href={item.cta.href}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {item.cta.label}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function ProblemStatement() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      aria-labelledby="problem-statement-heading"
      className="bg-white py-24 dark:bg-gray-950 sm:py-32" id="problem-statement"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-16 text-center heading-glow"
        >
          <h2
            id="problem-statement-heading"
            className="section-heading mb-6 text-gray-900 dark:text-white"
          >
            One Platform. Three Audiences. Infinite Value.
          </h2>
          <p className="section-subheading mx-auto max-w-3xl text-gray-600 dark:text-gray-300">
            Traditional API platforms force you to choose: provider or consumer. We serve{' '}
            <span className="font-semibold text-primary-600 dark:text-primary-400">everyone</span>.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <motion.div variants={staggerFast} initial="initial" animate={isInView ? 'animate' : 'initial'} className="grid gap-8 md:grid-cols-3">
          {problems.map((item, index) => (
            <PersonaCard key={item.audience} item={item} index={index} isInView={isInView} />
          ))}
        </motion.div>

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
