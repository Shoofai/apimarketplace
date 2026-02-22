'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, CreditCard, Shield, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Counter } from '@/components/ui/counter';
import { trackCTAClick } from '@/lib/analytics';
import { fadeIn, slideUp, staggerContainer } from '@/lib/animations';
import { APIConstellation } from '../APIConstellation';
import { DemoModal } from '../DemoModal';
import { HeroQuiz } from '../HeroQuiz';
import LiveActivityTicker from '../LiveActivityTicker';
import { MagneticButton } from '../MagneticButton';
import { Sparkline } from '../Sparkline';

const USED_BY = ['Stripe', 'Supabase', 'Vercel', 'Twilio', 'Notion', 'Linear', 'Figma', 'Resend'];

const VALUE_BULLETS = [
  { icon: Sparkles, label: 'AI code gen' },
  { icon: CreditCard, label: 'One-click monetization' },
  { icon: Shield, label: 'Enterprise governance' },
  { icon: Zap, label: '2-min to production' },
];

export default function HeroDeveloper() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [quizOpen, setQuizOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  const handleCTAClick = async (ctaType: string) => {
    await trackCTAClick({
      cta_type: ctaType,
      cta_location: 'hero',
    });
  };

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-gradient-hero dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-primary-900/20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.15]">
        <div
          className="absolute inset-0 animate-[grid-pulse_8s_ease-in-out_infinite]"
          style={{ backgroundImage: 'url(/grid.svg)', backgroundSize: '60px 60px' }}
        />
      </div>
      {/* Radial gradient orbs */}
      <div className="absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-primary-400/30 blur-3xl dark:bg-primary-500/20" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-primary-400/30 blur-3xl dark:bg-primary-500/20" />

      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-100/30 via-transparent to-transparent dark:bg-gradient-glow" />

      {/* Content-aligned glow behind headline */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 28%, rgba(139, 92, 246, 0.12), transparent 55%)',
        }}
      />

      <APIConstellation mouseX={mousePos.x} mouseY={mousePos.y} />

      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeIn} className="mb-8">
            <span className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-900 shadow-sm dark:bg-white/5 dark:text-white">
              10K+ APIs · 500K+ Developers · $100M+ Revenue Processed
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={slideUp}
            className="mb-4 max-w-5xl font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white"
          >
            <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent dark:from-primary-300 dark:via-primary-400 dark:to-primary-500">
              The Only API Platform
            </span>
            <br />
            Where Providers & Developers Both Win
          </motion.h1>

          {/* Subheadline - slightly smaller for hierarchy */}
          <motion.p
            variants={slideUp}
            className="mb-6 max-w-3xl text-base font-medium leading-relaxed text-gray-700 sm:text-lg lg:text-xl dark:text-primary-100"
          >
            From API discovery to production in 2 minutes. Test before you buy, AI-generated code, one-click monetization,
            and enterprise governance—all in one place.
          </motion.p>

          {/* Value bullets row */}
          <motion.div
            variants={slideUp}
            className="mb-8 flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-primary-100/90"
          >
            {VALUE_BULLETS.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary-300" />
                {label}
              </span>
            ))}
          </motion.div>

          {/* Hero code block - dark bg in both modes for legibility on hero gradient */}
          <motion.div
            variants={slideUp}
            className="mb-8 w-full max-w-2xl rounded-xl border border-white/20 bg-white/10 px-4 py-3 ring-1 ring-primary-500/20 dark:border-white/10 dark:bg-gray-900/80 dark:ring-primary-500/20"
          >
            <pre className="overflow-x-auto text-left text-sm leading-relaxed text-gray-800 dark:text-gray-300">
              <code>
                <span className="text-primary-600 dark:text-primary-300">$</span> curl -X POST https://api.example.com/v1/call
                {'\n  '}-H <span className="text-green-700 dark:text-green-400">&quot;Authorization: Bearer $API_KEY&quot;</span>
                {'\n  '}-d <span className="text-green-700 dark:text-green-400">&apos;{'{ "method": "charges.create" }'}&apos;</span>
                {'\n'}
                <span className="text-gray-500 dark:text-gray-500">{'// → 200 OK in 2 minutes'}</span>
              </code>
            </pre>
          </motion.div>

          {/* CTAs - single primary, ghost secondary */}
          <motion.div variants={slideUp} className="mb-4 flex flex-col gap-4 sm:flex-row sm:gap-6">
            <MagneticButton>
              <Button
                variant="cta"
                size="xl"
                className="group font-medium shadow-glow-cta transition-shadow hover:shadow-lg"
                onClick={() => {
                  setQuizOpen(true);
                  handleCTAClick('start_building_quiz');
                }}
              >
                Start Building
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button
                variant="ghost"
                size="xl"
                className="text-gray-600 hover:bg-gray-100 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                onClick={() => {
                  setDemoOpen(true);
                  handleCTAClick('watch_demo');
                }}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch 2-min Demo
              </Button>
            </MagneticButton>
          </motion.div>
          <HeroQuiz open={quizOpen} onOpenChange={setQuizOpen} />
          <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />

          <motion.p variants={slideUp} className="mb-6 text-sm text-gray-600 dark:text-primary-200/90">
            No credit card required · Free tier included · Start building in minutes
          </motion.p>

          {/* Used by strip */}
          <motion.div variants={fadeIn} className="mb-12">
            <p className="mb-3 text-xs uppercase tracking-wider text-gray-600 dark:text-white/70">Used by developers at</p>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-gray-600 dark:text-white/80">
              {USED_BY.map((name, i) => (
                <span key={name}>
                  {name}
                  {i < USED_BY.length - 1 && <span className="ml-2 text-gray-400 dark:text-white/50">·</span>}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Stats Bar - use dark overlay in both modes so white text stays readable */}
          <motion.div
            variants={fadeIn}
            className="grid w-full max-w-4xl grid-cols-1 gap-8 rounded-2xl border-2 border-gray-200 bg-white/80 px-8 py-10 shadow-xl backdrop-blur-xl sm:grid-cols-3 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex items-center justify-center gap-3">
                <div className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  <Counter end={10000} suffix="+" />
                </div>
                <Sparkline
                  data={[20, 35, 42, 55, 48, 70, 85, 90]}
                  className="h-5 w-12 text-primary-300"
                  strokeColor="currentColor"
                />
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-primary-200/90">APIs Listed</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex items-center justify-center gap-3">
                <div className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  <Counter end={500000} suffix="+" />
                </div>
                <Sparkline
                  data={[15, 28, 38, 52, 65, 75, 82, 95]}
                  className="h-5 w-12 text-primary-300"
                  strokeColor="currentColor"
                />
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-primary-200/90">Active Developers</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex items-center justify-center gap-3">
                <div className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  <Counter end={100} prefix="$" suffix="M+" />
                </div>
                <Sparkline
                  data={[22, 40, 55, 68, 72, 88, 92, 98]}
                  className="h-5 w-12 text-primary-300"
                  strokeColor="currentColor"
                />
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-primary-200/90">Revenue Processed</div>
            </div>
          </motion.div>

          {/* Discover → Integrate → Ship */}
          <motion.div
            variants={fadeIn}
            className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-600 dark:text-white/60"
          >
            <span className="rounded-md bg-white/90 px-3 py-1.5 shadow-sm dark:bg-white/5">Discover</span>
            <ChevronRight className="h-4 w-4" />
            <span className="rounded-md bg-white/90 px-3 py-1.5 shadow-sm dark:bg-white/5">Integrate</span>
            <ChevronRight className="h-4 w-4" />
            <span className="rounded-md bg-white/90 px-3 py-1.5 shadow-sm dark:bg-white/5">Ship</span>
          </motion.div>

          <motion.div variants={fadeIn} className="mx-auto mt-8 w-full max-w-2xl">
            <LiveActivityTicker variant="hero" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            className="mt-16"
          >
            <div className="flex flex-col items-center text-gray-600 dark:text-primary-200">
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
