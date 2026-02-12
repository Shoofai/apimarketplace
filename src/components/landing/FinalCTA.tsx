'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
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
    <section ref={ref} className="relative overflow-hidden bg-gradient-hero py-24 sm:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/grid.svg)' }} />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          className="space-y-8"
        >
          {/* Badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              ⚡ Join 10,000+ API providers already scaling
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-heading text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ready to 10X Your
            <br />
            API Business?
          </h2>

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-blue-100">
            Start monetizing your APIs today. No credit card required. Free forever for developers.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button
              variant="gradient"
              size="xl"
              onClick={() => handleCTAClick('final_start_free_trial')}
              className="group bg-white text-primary-900 shadow-glow-purple hover:bg-gray-50"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => handleCTAClick('final_book_demo')}
              className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Enterprise Demo
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
