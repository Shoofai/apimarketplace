'use client';

import { motion } from 'framer-motion';
import { Check, CreditCard, MessageSquare } from 'lucide-react';

const APPS = [
  { id: 'stripe', name: 'Stripe', icon: CreditCard },
  { id: 'slack', name: 'Slack', icon: MessageSquare },
];

interface AppConnectionPanelProps {
  connected: boolean;
}

const tileBase =
  'flex flex-1 flex-col items-center justify-center rounded-xl border py-4 transition-shadow duration-300 dark:border-gray-700';
const tileDefault =
  'border-gray-200 bg-gray-50 dark:bg-gray-800/40 hover:ring-2 hover:ring-primary-500/30 hover:shadow-[0_0_20px_-4px_rgba(139,92,246,0.35)]';
const tileConnected =
  'ring-2 ring-primary-500/50 border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/60';

export default function AppConnectionPanel({ connected }: AppConnectionPanelProps) {
  const renderTile = (app: (typeof APPS)[0], index: number) => {
    const Icon = app.icon;
    return (
      <motion.div
        key={app.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        whileHover={{ scale: 1.03 }}
        className={`relative ${tileBase} ${connected ? tileConnected : tileDefault}`}
      >
        {connected && (
          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Check className="h-3 w-3" />
          </span>
        )}
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-white/10 dark:text-primary-400">
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{app.name}</span>
      </motion.div>
    );
  };

  return (
    <div className="flex items-center gap-2">
      {renderTile(APPS[0], 0)}
      {/* Connector line — animates and turns bright when connected; data flow when connected */}
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
            className={connected ? 'drop-shadow-[0_0_10px_rgba(167,139,250,0.9)]' : ''}
          />
          {/* Data flow: moving dash when connected */}
          {connected && (
            <motion.line
              x1="0"
              y1="4"
              x2="100"
              y2="4"
              stroke="url(#connectorGradientBright)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="8 6"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -28 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="drop-shadow-[0_0_6px_rgba(167,139,250,0.6)]"
            />
          )}
        </svg>
      </div>
      {renderTile(APPS[1], 1)}
    </div>
  );
}
