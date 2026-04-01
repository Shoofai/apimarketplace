'use client';

import { motion, useInView } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  Activity,
  Lock,
  Fingerprint,
  Quote,
} from 'lucide-react';
import { useRef } from 'react';
import { TESTIMONIALS } from '@/lib/testimonials';

const trustBadges = [
  { label: 'SOC 2 Type II (in progress)', icon: Shield },
  { label: 'GDPR Compliant', icon: ShieldCheck },
  { label: '99.9% Uptime SLA', icon: Activity },
  { label: 'Enterprise SSO', icon: Lock },
  { label: 'MFA Enforced', icon: Fingerprint },
];

export default function EnterpriseTrust() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      aria-labelledby="enterprise-trust-heading"
      className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-16 text-center heading-glow"
        >
          <h2
            id="enterprise-trust-heading"
            className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
          >
            Trusted by Engineering Teams Worldwide
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Enterprise-grade security and compliance built into every layer.
          </p>
        </motion.div>

        {/* Part 1: Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.1 }}
          className="mb-20 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={
                  isInView
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.9 }
                }
                transition={{ delay: 0.15 + index * 0.07 }}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden />
                {badge.label}
              </motion.div>
            );
          })}
        </motion.div>
        <p className="text-center text-xs text-muted-foreground mb-16">
          *SOC 2 Type II audit is in progress. Contact us for our current security posture documentation.
        </p>

        {/* Part 2: Testimonials */}
        <div className="grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.3 + index * 0.15 }}
              className="flex flex-col card-elevated p-8"
            >
              {/* Quote icon */}
              <Quote className="mb-4 h-8 w-8 text-gray-200 dark:text-gray-600" aria-hidden />

              {/* Testimonial text */}
              <p className="flex-1 text-base leading-relaxed text-gray-700 dark:text-gray-300">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Person info */}
              <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.title}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
