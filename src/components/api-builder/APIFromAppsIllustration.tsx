'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import AppConnectionPanel from './AppConnectionPanel';
import GenerateAPIButton from './GenerateAPIButton';
import GeneratedAPICard, { type GeneratedAPI } from './GeneratedAPICard';
import { Button } from '@/components/ui/button';

interface APIFromAppsIllustrationProps {
  connected: boolean;
  generating: boolean;
  generatedApi: GeneratedAPI | null;
  onConnect: () => void;
  onGenerate: () => void;
}

export default function APIFromAppsIllustration({
  connected,
  generating,
  generatedApi,
  onConnect,
  onGenerate,
}: APIFromAppsIllustrationProps) {
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (generatedApi) {
      setShowSuccessToast(true);
      const t = setTimeout(() => setShowSuccessToast(false), 1500);
      return () => clearTimeout(t);
    }
  }, [generatedApi]);

  return (
    <div className="flex min-h-[min(420px,65vh)] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-xl ring-1 ring-gray-200/50 dark:border-gray-600 dark:bg-gradient-to-b dark:from-gray-800/90 dark:to-gray-800/50 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2),0_0_50px_-8px_rgba(139,92,246,0.3)] dark:ring-white/5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-1 flex-col"
      >
        {/* Card header */}
        <p className="mb-4 text-xs font-medium tracking-wider text-primary-600 dark:text-primary-400">
          Connect apps → Generate API
        </p>
        <AppConnectionPanel connected={connected} />
        {/* Step progress */}
        <div className="mt-4 flex items-center gap-2" aria-label="Progress">
          <div className="flex items-center gap-1.5">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                connected
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-primary-100 text-primary-600 dark:bg-white/20 dark:text-primary-400'
              }`}
            >
              {connected ? <Check className="h-3.5 w-3.5" /> : '1'}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Connect</span>
          </div>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600" />
          <div className="flex items-center gap-1.5">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                generatedApi
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : connected
                    ? 'bg-primary-100 text-primary-600 dark:bg-white/20 dark:text-primary-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-gray-500'
              }`}
            >
              {generatedApi ? <Check className="h-3.5 w-3.5" /> : '2'}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Generate</span>
          </div>
        </div>
        {/* Step 1: Connect */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
        >
          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            Step 1
          </span>
          <p className="mb-2 text-xs text-muted-foreground">Link Stripe and Slack</p>
          <Button
            variant="outline"
            size="lg"
            className="w-full border-gray-300 bg-gray-50 text-gray-900 hover:border-primary-400/50 hover:bg-primary-500/10 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-primary-400/50 dark:hover:bg-primary-500/10 dark:hover:text-white dark:disabled:border-emerald-500/30 dark:disabled:bg-emerald-500/10 dark:disabled:text-emerald-400 disabled:border-emerald-500/30 disabled:bg-emerald-500/10 disabled:text-emerald-600"
            onClick={onConnect}
            disabled={connected}
          >
            {connected ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Connected
              </>
            ) : (
              'Connect'
            )}
          </Button>
        </motion.div>
        {/* Step 2: Generate API */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
        >
          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            Step 2
          </span>
          <p className="mb-2 text-xs text-muted-foreground">We generate the route and sample code</p>
          <motion.div
            key={connected ? 'enabled' : 'disabled'}
            initial={connected ? { scale: 1.03 } : false}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <GenerateAPIButton
              connected={connected}
              generating={generating}
              onGenerate={onGenerate}
            />
          </motion.div>
        </motion.div>
        <AnimatePresence>
          {showSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400"
              role="status"
              aria-live="polite"
            >
              <Check className="h-4 w-4 shrink-0" />
              Generated
            </motion.div>
          )}
        </AnimatePresence>
        {generatedApi && <GeneratedAPICard generatedApi={generatedApi} />}
        {/* Powered by / trust line */}
        <div className="mt-auto flex items-center justify-center gap-1.5 pt-6 text-xs text-muted-foreground">
          <Zap className="h-3.5 w-3.5" />
          <span>One-click integration</span>
        </div>
      </motion.div>
    </div>
  );
}
