'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Counter } from '@/components/ui/counter';
import { trackCTAClick } from '@/lib/analytics';
import { fadeIn, slideUp, staggerContainer } from '@/lib/animations';

export default function Hero() {
  const handleCTAClick = async (ctaType: string) => {
    await trackCTAClick({
      cta_type: ctaType,
      cta_location: 'hero',
    });
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-hero dark:bg-gradient-to-br dark:from-gray-900 dark:via-primary-900/30 dark:to-accent-900/30">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/grid.svg)' }} />
      </div>

      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-glow" />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeIn} className="mb-8">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm dark:bg-white/5">
              🚀 Now Live: AI-Powered API Discovery
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={slideUp}
            className="mb-6 max-w-5xl font-heading text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            The AI-Powered API Marketplace
            <br />
            <span className="bg-gradient-to-r from-accent-300 to-primary-300 bg-clip-text text-transparent">
              That Runs Itself
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={slideUp}
            className="mb-10 max-w-3xl text-xl leading-relaxed text-blue-100 sm:text-2xl"
          >
            Monetize APIs with zero friction. Discover APIs with AI-powered code generation. Govern
            at enterprise scale.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={slideUp}
            className="mb-16 flex flex-col gap-4 sm:flex-row sm:gap-6"
          >
            <Button
              variant="gradient"
              size="xl"
              onClick={() => handleCTAClick('start_free_trial')}
              className="group shadow-glow"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => handleCTAClick('watch_demo')}
              className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch 2-Min Demo
            </Button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            variants={fadeIn}
            className="grid w-full max-w-4xl grid-cols-1 gap-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md dark:border-white/5 dark:bg-white/5 sm:grid-cols-3"
          >
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-white">
                <Counter end={10000} suffix="+" />
              </div>
              <div className="text-sm font-medium text-blue-200">APIs Listed</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-white">
                <Counter end={500000} suffix="+" />
              </div>
              <div className="text-sm font-medium text-blue-200">Active Developers</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-white">
                <Counter end={100} prefix="$" suffix="M+" />
              </div>
              <div className="text-sm font-medium text-blue-200">Revenue Processed</div>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            className="mt-16"
          >
            <div className="flex flex-col items-center text-blue-200">
              <span className="mb-2 text-sm">Scroll to explore</span>
              <svg
                className="h-6 w-6 animate-bounce"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
