'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Counter } from '@/components/ui/counter';
import { trackCTAClick } from '@/lib/analytics';
import { fadeIn, slideUp, staggerContainer } from '@/lib/animations';
import { APIConstellation } from './APIConstellation';
import { DemoModal } from './DemoModal';
import { HeroQuiz } from './HeroQuiz';
import LiveActivityTicker from './LiveActivityTicker';
import { MagneticButton } from './MagneticButton';
import { Sparkline } from './Sparkline';

export default function Hero() {
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
      className="relative min-h-screen overflow-hidden bg-gradient-hero dark:bg-gradient-to-br dark:from-gray-900 dark:via-primary-900/30 dark:to-accent-900/30"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-[0.15]">
        <div
          className="absolute inset-0 animate-[grid-pulse_8s_ease-in-out_infinite]"
          style={{ backgroundImage: 'url(/grid.svg)', backgroundSize: '60px 60px' }}
        />
      </div>
      {/* Radial gradient orbs for depth */}
      <div className="absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />

      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-glow" />

      {/* API Constellation Background */}
      <APIConstellation mouseX={mousePos.x} mouseY={mousePos.y} />

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
              10K+ APIs · 500K+ Developers · $100M+ Revenue Processed
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={slideUp}
            className="mb-6 max-w-5xl font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            The Only API Platform Where
            <br />
            <span className="bg-gradient-to-r from-accent-300 via-primary-300 to-accent-400 bg-clip-text text-transparent">
              Providers & Developers Both Win
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={slideUp}
            className="mb-10 max-w-3xl text-lg font-medium leading-relaxed text-blue-100 sm:text-xl lg:text-2xl"
          >
            From API discovery to production in 2 minutes. AI-generated code, one-click monetization,
            and enterprise governance—all in one place.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={slideUp} className="mb-4 flex flex-col gap-4 sm:flex-row sm:gap-6">
            <MagneticButton>
              <Button
                variant="gradient"
                size="xl"
                className="group shadow-glow transition-shadow hover:shadow-lg"
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
                variant="outline"
                size="xl"
                className="border-white/20 bg-white/10 text-white backdrop-blur-sm transition-shadow hover:bg-white/20 hover:shadow-lg"
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
          <motion.p variants={slideUp} className="mb-16 text-sm text-blue-200/90">
            No credit card required · Free tier included · Start building in minutes
          </motion.p>

          {/* Stats Bar */}
          <motion.div
            variants={fadeIn}
            className="grid w-full max-w-4xl grid-cols-1 gap-8 rounded-2xl border-2 border-white/20 bg-white/10 px-8 py-10 shadow-xl backdrop-blur-xl transition-shadow hover:shadow-2xl sm:grid-cols-3 dark:border-white/10 dark:bg-white/5"
          >
            <div className="group flex flex-col items-center text-center">
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
              <div className="text-sm font-semibold uppercase tracking-wider text-blue-200/90">APIs Listed</div>
            </div>
            <div className="group flex flex-col items-center text-center">
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
              <div className="text-sm font-semibold uppercase tracking-wider text-blue-200/90">Active Developers</div>
            </div>
            <div className="group flex flex-col items-center text-center">
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
              <div className="text-sm font-semibold uppercase tracking-wider text-blue-200/90">Revenue Processed</div>
            </div>
          </motion.div>

          {/* Live Activity Ticker */}
          <motion.div variants={fadeIn} className="mx-auto mt-8 w-full max-w-2xl">
            <LiveActivityTicker variant="hero" />
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
