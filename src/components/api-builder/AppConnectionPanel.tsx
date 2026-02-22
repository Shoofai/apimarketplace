'use client';

import { motion } from 'framer-motion';
import { CreditCard, MessageSquare } from 'lucide-react';

const APPS = [
  { id: 'stripe', name: 'Stripe', icon: CreditCard },
  { id: 'slack', name: 'Slack', icon: MessageSquare },
];

interface AppConnectionPanelProps {
  connected: boolean;
}

export default function AppConnectionPanel({ connected }: AppConnectionPanelProps) {
  return (
    <div className="flex items-center gap-2">
      {APPS[0] && (() => {
        const Icon = APPS[0].icon;
        return (
          <motion.div
            key={APPS[0].id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0 }}
            className="flex flex-1 flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-4 dark:border-gray-700 dark:bg-gray-800/40"
          >
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-white/10 dark:text-primary-400">
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{APPS[0].name}</span>
          </motion.div>
        );
      })()}
      {/* Connector line — animates and turns bright when connected */}
      <div className="relative h-8 flex-1 min-w-[24px]">
        <svg className="h-full w-full" viewBox="0 0 100 8" preserveAspectRatio="none">
          <defs>
            <linearGradient id="connectorGradientDim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="connectorGradientBright" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="50%" stopColor="#a78bfa" stopOpacity="1" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
            </linearGradient>
          </defs>
          <motion.line
            x1="0"
            y1="4"
            x2="100"
            y2="4"
            stroke={connected ? 'url(#connectorGradientBright)' : 'url(#connectorGradientDim)'}
            strokeWidth={connected ? 3 : 2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: connected ? 1 : 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={connected ? 'drop-shadow-[0_0_6px_rgba(167,139,250,0.8)]' : ''}
          />
        </svg>
      </div>
      {APPS[1] && (() => {
        const Icon = APPS[1].icon;
        return (
          <motion.div
            key={APPS[1].id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-1 flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-4 dark:border-gray-700 dark:bg-gray-800/40"
          >
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-white/10 dark:text-primary-400">
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{APPS[1].name}</span>
          </motion.div>
        );
      })()}
    </div>
  );
}
