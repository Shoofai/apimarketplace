'use client';

import { motion } from 'framer-motion';

export interface GeneratedAPI {
  endpoint: string;
  method: string;
  snippet: string;
}

interface GeneratedAPICardProps {
  generatedApi: GeneratedAPI;
}

export default function GeneratedAPICard({ generatedApi }: GeneratedAPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mt-4 rounded-xl border border-gray-600 bg-gray-900/80 px-4 py-3 ring-1 ring-primary-500/20 dark:border-gray-700 dark:bg-black/40"
    >
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary-400">
        Generated API
      </div>
      <div className="mb-2 text-sm font-mono text-white">
        <span className="text-green-400">{generatedApi.method}</span>{' '}
        <span className="text-gray-300">{generatedApi.endpoint}</span>
      </div>
      <pre className="overflow-x-auto text-left text-xs leading-relaxed text-gray-300">
        <code>{generatedApi.snippet}</code>
      </pre>
    </motion.div>
  );
}
