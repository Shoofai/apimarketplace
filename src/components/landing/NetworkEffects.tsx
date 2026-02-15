'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Counter } from '@/components/ui/counter';
import { usePlatformName } from '@/contexts/PlatformNameContext';

export default function NetworkEffects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const platformName = usePlatformName();

  return (
    <section ref={ref} className="bg-gradient-to-br from-primary-900 to-accent-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-16 text-center"
        >
          <h2 className="section-heading mb-6 text-white">
            Network Effects That Compound Daily
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-blue-100">
            Traditional marketplaces grow linearly. We grow exponentially. Every participant makes
            the platform more valuable for everyone.
          </p>
        </motion.div>

        {/* Flywheel Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="mx-auto max-w-4xl">
            <div className="relative aspect-square rounded-full border border-white/10 bg-white/5 p-12 backdrop-blur-md shadow-2xl ring-1 ring-white/20">
              {/* Center Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex h-40 w-40 flex-col items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-primary-600 text-center shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] ring-4 ring-white/10">
                  <TrendingUp className="mb-2 h-10 w-10 text-white" />
                  <span className="text-lg font-bold text-white">Growth</span>
                  <span className="text-sm text-white/90">Flywheel</span>
                </div>
              </div>

              {/* Flywheel Steps */}
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-4">
                {/* Top Left */}
                <div className="flex items-start justify-start">
                  <div className="max-w-xs rounded-2xl border border-accent-400/30 bg-accent-500/10 p-6 backdrop-blur-md transition-transform hover:scale-105">
                    <div className="mb-2 text-3xl font-black text-accent-300">1</div>
                    <p className="text-base font-semibold text-white">More API Providers Join</p>
                  </div>
                </div>

                {/* Top Right */}
                <div className="flex items-start justify-end">
                  <div className="max-w-xs rounded-2xl border border-blue-400/30 bg-blue-500/10 p-6 backdrop-blur-md transition-transform hover:scale-105">
                    <div className="mb-2 text-3xl font-black text-blue-300">2</div>
                    <p className="text-base font-semibold text-white">More Developers Discover APIs</p>
                  </div>
                </div>

                {/* Bottom Left */}
                <div className="flex items-end justify-start">
                  <div className="max-w-xs rounded-2xl border border-green-400/30 bg-green-500/10 p-6 backdrop-blur-md transition-transform hover:scale-105">
                    <div className="mb-2 text-3xl font-black text-green-300">4</div>
                    <p className="text-base font-semibold text-white">
                      Higher Revenue Attracts More Providers
                    </p>
                  </div>
                </div>

                {/* Bottom Right */}
                <div className="flex items-end justify-end">
                  <div className="max-w-xs rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-6 backdrop-blur-md transition-transform hover:scale-105">
                    <div className="mb-2 text-3xl font-black text-yellow-300">3</div>
                    <p className="text-base font-semibold text-white">More Integrations = More Revenue</p>
                  </div>
                </div>
              </div>

              {/* Arrows */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <ArrowRight className="absolute left-1/2 top-1/4 h-6 w-6 -translate-x-12 -translate-y-1/2 rotate-45 text-accent-300" />
                <ArrowRight className="absolute right-1/4 top-1/2 h-6 w-6 -translate-y-12 translate-x-1/2 rotate-135 text-blue-300" />
                <ArrowRight className="absolute bottom-1/4 left-1/2 h-6 w-6 -translate-x-12 translate-y-1/2 rotate-225 text-yellow-300" />
                <ArrowRight className="absolute left-1/4 top-1/2 h-6 w-6 -translate-y-12 -translate-x-1/2 rotate-315 text-green-300" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comparison: Linear vs Exponential */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.4 }}
          className="grid gap-8 md:grid-cols-2"
        >
          {/* Traditional Marketplaces */}
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 backdrop-blur-sm transition-colors hover:bg-red-500/10">
            <h3 className="mb-4 text-2xl font-bold text-white">Traditional Marketplaces</h3>
            <p className="mb-8 text-lg leading-relaxed text-blue-100/80">Linear growth. Every new customer costs money.</p>
            <div className="space-y-4 text-base text-blue-100">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-400">✗</div>
                <span>Manual API listings</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-400">✗</div>
                <span>Custom integration every time</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-400">✗</div>
                <span>High customer acquisition cost</span>
              </div>
            </div>
            <div className="mt-8 text-4xl font-black text-red-400">+10% monthly growth</div>
          </div>

          {/* Platform name */}
          <div className="relative overflow-hidden rounded-3xl border border-green-500/30 bg-green-500/10 p-10 backdrop-blur-sm ring-1 ring-green-500/50 transition-colors hover:bg-green-500/15">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-500/20 blur-3xl" />
            <h3 className="mb-4 text-2xl font-bold text-white">{platformName}</h3>
            <p className="mb-8 text-lg leading-relaxed text-blue-100/80">Exponential growth. Network effects do the work.</p>
            <div className="space-y-4 text-base text-blue-100">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400">✓</div>
                <span>AI auto-generates everything</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400">✓</div>
                <span>Universal SDK works for all APIs</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400">✓</div>
                <span>Viral referral mechanics built-in</span>
              </div>
            </div>
            <div className="mt-8 text-4xl font-black text-green-400">
              <Counter end={50} suffix="% monthly growth" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
