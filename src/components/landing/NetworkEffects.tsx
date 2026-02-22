'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Building2, Code2, TrendingUp, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Counter } from '@/components/ui/counter';
import { usePlatformName } from '@/contexts/PlatformNameContext';
import { cn } from '@/lib/utils';

const PRIMARY_GRADIENTS = [
  'from-primary-500 to-primary-700',
  'from-primary-400 to-primary-600',
  'from-primary-600 to-primary-800',
] as const;
const PRIMARY_GRADIENT_DARK = 'dark:from-primary-400 dark:to-primary-600';

const FLYWHEEL_STEPS = [
  { num: 1, label: 'More API Providers Join', icon: Building2 },
  { num: 2, label: 'More Developers Discover APIs', icon: Code2 },
  { num: 3, label: 'More Integrations = More Revenue', icon: TrendingUp },
  { num: 4, label: 'Higher Revenue Attracts More Providers', icon: DollarSign },
] as const;

export default function NetworkEffects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: '50px 0px' });
  const platformName = usePlatformName();

  return (
    <section
      ref={ref}
      className="flex flex-col bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 py-24 sm:py-32"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-12 flex-shrink-0 text-center sm:mb-16"
        >
          <h2 className="section-heading mb-3 text-white sm:mb-4">
            Network Effects That Compound Daily
          </h2>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-primary-100 sm:text-lg">
            Traditional marketplaces grow linearly. We grow exponentially. Every participant makes
            the platform more valuable for everyone.
          </p>
        </motion.div>

        {/* 2x2 grid of steps */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ delay: 0.15 }}
          className="relative mb-8 sm:mb-10"
        >
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6"
            role="img"
            aria-label="Network effects flywheel: More API providers join, more developers discover APIs, more integrations create revenue, higher revenue attracts more providers. The cycle repeats."
          >
            {FLYWHEEL_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card
                  key={step.num}
                  className={cn(
                    'group relative h-full overflow-hidden rounded-2xl border-0 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:bg-gray-900',
                    'ring-0'
                  )}
                >
                  <div className="relative flex flex-col">
                    <div
                      className={cn(
                        'absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5',
                        PRIMARY_GRADIENTS[index % 3],
                        PRIMARY_GRADIENT_DARK
                      )}
                    />
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                          PRIMARY_GRADIENTS[index % 3],
                          PRIMARY_GRADIENT_DARK
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 text-sm font-bold text-primary-600 dark:text-primary-400">
                          Step {step.num}
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white sm:text-base">
                          {step.label}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <p className="mt-6 text-center text-sm font-medium text-primary-200/90">
            The cycle repeats.
          </p>
        </motion.div>

        {/* Comparison: Linear vs Exponential */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 md:grid-cols-2"
        >
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 backdrop-blur-sm transition-colors hover:bg-red-500/10 sm:p-6">
            <h3 className="mb-2 text-lg font-bold text-white sm:text-xl">Traditional Marketplaces</h3>
            <p className="mb-4 text-sm leading-relaxed text-primary-100/80 sm:text-base">Linear growth. Every new customer costs money.</p>
            <div className="space-y-2 text-sm text-primary-100 sm:text-base">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">✗</div>
                <span>Manual API listings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">✗</div>
                <span>Custom integration every time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">✗</div>
                <span>High customer acquisition cost</span>
              </div>
            </div>
            <div className="mt-4 text-2xl font-black text-red-400 sm:text-3xl">+10% monthly growth</div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-green-500/30 bg-green-500/10 p-5 backdrop-blur-sm ring-1 ring-green-500/50 transition-colors hover:bg-green-500/15 sm:p-6">
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-green-500/20 blur-3xl sm:h-48 sm:w-48" />
            <h3 className="relative mb-2 text-lg font-bold text-white sm:text-xl">{platformName}</h3>
            <p className="relative mb-4 text-sm leading-relaxed text-primary-100/80 sm:text-base">Exponential growth. Network effects do the work.</p>
            <div className="relative space-y-2 text-sm text-primary-100 sm:text-base">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">✓</div>
                <span>AI auto-generates everything</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">✓</div>
                <span>Universal SDK works for all APIs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">✓</div>
                <span>Viral referral mechanics built-in</span>
              </div>
            </div>
            <div className="relative mt-4 text-2xl font-black text-green-400 sm:text-3xl">
              <Counter end={50} suffix="% monthly growth" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
