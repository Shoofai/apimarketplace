'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

const ACTIVITIES = [
  { id: 1, text: 'John D. integrated Stripe API', city: 'San Francisco' },
  { id: 2, text: 'Acme Corp published Weather API', city: 'New York' },
  { id: 3, text: 'Dev from Berlin discovered 5 APIs', city: 'Berlin' },
  { id: 4, text: 'Sarah M. subscribed to OpenAI GPT-4', city: 'London' },
  { id: 5, text: 'TechStart published Payments API', city: 'Austin' },
  { id: 6, text: 'Alex K. completed first integration', city: 'Toronto' },
  { id: 7, text: 'DataCo listed 12 new data APIs', city: 'Singapore' },
  { id: 8, text: 'Developer from Tokyo explored marketplace', city: 'Tokyo' },
];

interface LiveActivityTickerProps {
  variant?: 'default' | 'hero';
}

export default function LiveActivityTicker({ variant = 'default' }: LiveActivityTickerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % ACTIVITIES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const activity = ACTIVITIES[index];

  const isHero = variant === 'hero';
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 backdrop-blur-sm ${
        isHero
          ? 'border border-gray-200 bg-white/90 shadow-sm dark:border-white/10 dark:bg-white/5'
          : 'border border-gray-200 bg-white/80 dark:border-gray-800 dark:bg-gray-900/80'
      }`}
    >
      <span className="flex items-center gap-1.5 text-amber-500">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        <Zap className="h-4 w-4" />
      </span>
      <span className={`text-sm font-medium ${isHero ? 'text-gray-600 dark:text-primary-200/90' : 'text-gray-500 dark:text-gray-400'}`}>
        Example activity:
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={activity.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className={`text-sm font-medium ${isHero ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}
        >
          {activity.text}
        </motion.span>
      </AnimatePresence>
      <span className={`text-xs ${isHero ? 'text-gray-500 dark:text-primary-200/70' : 'text-gray-400 dark:text-gray-500'}`}>
        · {activity.city}
      </span>
    </div>
  );
}
