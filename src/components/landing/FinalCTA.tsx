'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackCTAClick } from '@/lib/analytics';

export default function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const handleCTAClick = async (ctaType: string) => {
    await trackCTAClick({
      cta_type: ctaType,
      cta_location: 'final_cta',
    });
  };

  return (
    <section ref={ref} className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 py-24 sm:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-transparent to-transparent" />
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />

      {/* Content */}
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          className="space-y-8"
        >
          {/* Badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20">
              ⚡ One platform for API discovery, integration, and monetization
            </span>
          </div>

          {/* Headline */}
          <h2 className="section-heading leading-[1.15] text-white">
            Ready to 10X Your
            <br />
            API Business?
          </h2>

          {/* Subheadline */}
          <p className="section-subheading mx-auto max-w-2xl text-primary-100">
            Start monetizing your APIs today. No credit card required. Free forever for developers.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button
              variant="cta"
              size="xl"
              asChild
              className="group h-14 px-8 text-lg shadow-glow-cta transition-all hover:scale-105"
            >
              <Link href="/signup" onClick={() => handleCTAClick('final_start_free_trial')}>
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              asChild
              className="h-14 border-white/20 bg-white/5 px-8 text-lg text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
            >
              <Link href="/marketplace" onClick={() => handleCTAClick('final_book_demo')}>
                <Calendar className="mr-2 h-5 w-5" />
                Browse APIs
              </Link>
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Setup in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>14-day money-back guarantee</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
