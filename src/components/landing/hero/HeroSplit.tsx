'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackCTAClick } from '@/lib/analytics';
import { fadeIn, slideUp, staggerContainer } from '@/lib/animations';
import APIFromAppsIllustration from '@/components/api-builder/APIFromAppsIllustration';
import type { GeneratedAPI } from '@/components/api-builder/GeneratedAPICard';
import { DemoModal } from '../DemoModal';
import { HeroQuiz } from '../HeroQuiz';
import { MagneticButton } from '../MagneticButton';

const USED_BY = ['Stripe', 'Supabase', 'Vercel', 'Twilio', 'Notion', 'Linear', 'Figma', 'Resend'];

// Precomputed line coords (avoids server/client float precision mismatch)
const RADIATING_LINES = [
  { x1: 70, y1: 50, x2: 100, y2: 50 },
  { x1: 67.32, y1: 60, x2: 93.3, y2: 75 },
  { x1: 60, y1: 67.32, x2: 75, y2: 93.3 },
  { x1: 50, y1: 70, x2: 50, y2: 100 },
  { x1: 40, y1: 67.32, x2: 25, y2: 93.3 },
  { x1: 32.68, y1: 60, x2: 6.7, y2: 75 },
  { x1: 30, y1: 50, x2: 0, y2: 50 },
  { x1: 32.68, y1: 40, x2: 6.7, y2: 25 },
  { x1: 40, y1: 32.68, x2: 25, y2: 6.7 },
  { x1: 50, y1: 30, x2: 50, y2: 0 },
  { x1: 60, y1: 32.68, x2: 75, y2: 6.7 },
  { x1: 67.32, y1: 40, x2: 93.3, y2: 25 },
];

function RadiatingOrb() {
  return (
    <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 opacity-30 dark:opacity-60">
      <div className="absolute inset-0 rounded-full bg-primary-400/40 dark:bg-primary-500/30 blur-3xl" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {RADIATING_LINES.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.4"
            className="text-primary-500 dark:text-primary-400"
          />
        ))}
      </svg>
    </div>
  );
}

export default function HeroSplit() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedApi, setGeneratedApi] = useState<GeneratedAPI | null>(null);

  const handleCTAClick = async (ctaType: string) => {
    await trackCTAClick({
      cta_type: ctaType,
      cta_location: 'hero',
    });
  };

  const handleConnect = () => setConnected(true);

  const handleGenerate = async () => {
    if (!connected) return;
    setGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setGeneratedApi({
        endpoint: '/integrations/stripe-slack',
        method: 'POST',
        snippet: '{\n  "event": "payment.created",\n  "channel": "#payments",\n  "message": "New payment: ${{amount}}"\n}',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100/50 dark:bg-gradient-hero dark:from-gray-900 dark:via-primary-900/30 dark:to-primary-900/30">
      {/* Dot/grid pattern */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.12]">
        <div
          className="absolute inset-0 animate-[grid-pulse_8s_ease-in-out_infinite]"
          style={{ backgroundImage: 'url(/grid.svg)', backgroundSize: '60px 60px' }}
        />
      </div>
      {/* Upper-right orb with radiating lines */}
      <RadiatingOrb />
      {/* Gradient glow - subtle in light, stronger in dark */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-100/30 via-transparent to-transparent dark:bg-gradient-glow" />

      {/* Section 1 — Main hero: split layout (Option B: fits in viewport, responsive spacing) */}
      <div className="relative mx-auto flex min-h-0 flex-1 flex-col justify-center px-4 pt-8 pb-4 sm:px-6 sm:pt-12 sm:pb-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_360px] lg:gap-10">
          {/* Left: headline + CTAs */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-col"
          >
          {/* Badge — top-left aligned */}
          <motion.div variants={fadeIn} className="mb-4 self-start sm:mb-6">
            <span className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-900 shadow-sm dark:bg-white/5 dark:text-white">
              Discover, integrate, and monetize APIs in one place
            </span>
          </motion.div>

          {/* Headline — clamp() for viewport-scaled type */}
          <motion.h1
            variants={slideUp}
            className="mb-3 max-w-5xl font-heading text-hero font-extrabold tracking-tight text-gray-900 sm:mb-5 dark:text-white"
          >
            <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent dark:from-primary-300 dark:via-primary-400 dark:to-primary-500">
              The Only API Platform
            </span>
            <br />
            Where Providers &amp;
            <br />
            Developers Both Win
          </motion.h1>

          {/* Subheadline — clamp() */}
          <motion.p
            variants={slideUp}
            className="mb-5 max-w-3xl font-medium leading-relaxed text-gray-700 text-subhero sm:mb-8 dark:text-primary-100"
          >
            From API discovery to production in 2 minutes. Test before you buy, AI-generated code,
            one-click monetization, and enterprise governance—all in one place.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={slideUp} className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <MagneticButton>
              <Button
                variant="cta"
                size="xl"
                className="group shadow-glow-cta transition-shadow hover:shadow-lg"
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
                className="text-gray-700 hover:bg-gray-100 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
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
        </motion.div>

          {/* Right: API from apps illustration */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="flex flex-col justify-center lg:min-h-[50vh] lg:pt-4"
          >
            <APIFromAppsIllustration
              connected={connected}
              generating={generating}
              generatedApi={generatedApi}
              onConnect={handleConnect}
              onGenerate={handleGenerate}
            />
          </motion.div>
        </div>
      </div>

      {/* Section 2 — Trust bar (same section, shrinks when space is tight) */}
      <div className="relative mx-auto max-w-7xl flex-shrink-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-4 sm:gap-6"
        >
          {/* Subheading + logo strip */}
          <motion.div variants={fadeIn} className="flex flex-col items-center text-center">
            <p className="mb-3 text-sm font-medium text-gray-600 dark:text-primary-200/90">
              Integrate with the tools you use
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-600 dark:text-white/80">
              {USED_BY.map((name, i) => (
                <span key={name}>
                  {name}
                  {i < USED_BY.length - 1 && <span className="ml-2 text-gray-400 dark:text-white/50">·</span>}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            className="mt-8"
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
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
