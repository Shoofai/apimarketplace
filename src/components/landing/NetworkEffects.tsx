'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Counter } from '@/components/ui/counter';

export default function NetworkEffects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="bg-gradient-to-br from-primary-900 to-accent-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
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
            <div className="relative aspect-square rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur-sm">
              {/* Center Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-primary-400 text-center shadow-glow">
                  <TrendingUp className="mb-1 h-8 w-8 text-white" />
                  <span className="text-sm font-bold text-white">Growth</span>
                  <span className="text-xs text-white/80">Flywheel</span>
                </div>
              </div>

              {/* Flywheel Steps */}
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-4">
                {/* Top Left */}
                <div className="flex items-start justify-start">
                  <div className="max-w-xs rounded-xl border border-accent-400/30 bg-accent-500/10 p-4 backdrop-blur-sm">
                    <div className="mb-1 text-2xl font-black text-white">1</div>
                    <p className="text-sm font-medium text-white">More API Providers Join</p>
                  </div>
                </div>

                {/* Top Right */}
                <div className="flex items-start justify-end">
                  <div className="max-w-xs rounded-xl border border-blue-400/30 bg-blue-500/10 p-4 backdrop-blur-sm">
                    <div className="mb-1 text-2xl font-black text-white">2</div>
                    <p className="text-sm font-medium text-white">More Developers Discover APIs</p>
                  </div>
                </div>

                {/* Bottom Left */}
                <div className="flex items-end justify-start">
                  <div className="max-w-xs rounded-xl border border-green-400/30 bg-green-500/10 p-4 backdrop-blur-sm">
                    <div className="mb-1 text-2xl font-black text-white">4</div>
                    <p className="text-sm font-medium text-white">
                      Higher Revenue Attracts More Providers
                    </p>
                  </div>
                </div>

                {/* Bottom Right */}
                <div className="flex items-end justify-end">
                  <div className="max-w-xs rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-4 backdrop-blur-sm">
                    <div className="mb-1 text-2xl font-black text-white">3</div>
                    <p className="text-sm font-medium text-white">More Integrations = More Revenue</p>
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
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 backdrop-blur-sm">
            <h3 className="mb-4 text-2xl font-semibold text-white">Traditional Marketplaces</h3>
            <p className="mb-6 leading-relaxed text-blue-100">Linear growth. Every new customer costs money.</p>
            <div className="space-y-3 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                <span>Manual API listings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                <span>Custom integration every time</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                <span>High customer acquisition cost</span>
              </div>
            </div>
            <div className="mt-6 text-3xl font-black text-red-400">+10% monthly growth</div>
          </div>

          {/* APIMarketplace Pro */}
          <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-8 backdrop-blur-sm">
            <h3 className="mb-4 text-2xl font-semibold text-white">APIMarketplace Pro</h3>
            <p className="mb-6 leading-relaxed text-blue-100">Exponential growth. Network effects do the work.</p>
            <div className="space-y-3 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>AI auto-generates everything</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Universal SDK works for all APIs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Viral referral mechanics built-in</span>
              </div>
            </div>
            <div className="mt-6 text-3xl font-black text-green-400">
              <Counter end={50} suffix="% monthly growth" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
