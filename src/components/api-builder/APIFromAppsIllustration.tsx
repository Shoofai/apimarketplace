'use client';

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
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl ring-1 ring-gray-200/50 dark:border-gray-600 dark:bg-gradient-to-b dark:from-gray-800/90 dark:to-gray-800/50 dark:shadow-[0_0_60px_-15px_rgba(139,92,246,0.15)] dark:ring-white/5">
      <AppConnectionPanel connected={connected} />
      {/* Step 1: Connect */}
      <div className="mt-4">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          Step 1
        </span>
        <Button
          variant="outline"
          size="lg"
          className="w-full border-gray-300 bg-gray-50 text-gray-900 hover:bg-gray-100 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          onClick={onConnect}
          disabled={connected}
        >
          {connected ? 'Connected' : 'Connect'}
        </Button>
      </div>
      {/* Step 2: Generate API */}
      <div className="mt-4">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          Step 2
        </span>
        <GenerateAPIButton
          connected={connected}
          generating={generating}
          onGenerate={onGenerate}
        />
      </div>
      {generatedApi && <GeneratedAPICard generatedApi={generatedApi} />}
    </div>
  );
}
