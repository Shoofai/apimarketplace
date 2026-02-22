'use client';

import { useState } from 'react';
import { Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import APIFromAppsIllustration from '@/components/api-builder/APIFromAppsIllustration';
import type { GeneratedAPI } from '@/components/api-builder/GeneratedAPICard';

export default function APIBuilderPage() {
  const [connected, setConnected] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedApi, setGeneratedApi] = useState<GeneratedAPI | null>(null);

  const handleConnect = () => {
    setConnected(true);
  };

  const handleGenerate = async () => {
    if (!connected) return;
    setGenerating(true);
    try {
      // Simulate API generation delay
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
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Plug className="h-6 w-6" />
          API Builder
        </h1>
        <p className="text-muted-foreground">
          Connect apps and generate a unified API for your integrations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left panel */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">How it works</h2>
            <p className="mt-2 text-muted-foreground">
              Select a source app (Stripe) and target app (Slack). Connect them, then generate a unified
              API endpoint that bridges events between the two.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">App selection</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Source: Stripe · Target: Slack (predefined for this demo)
            </p>
            <Button onClick={handleConnect} variant={connected ? 'secondary' : 'default'}>
              {connected ? 'Connected' : 'Connect Apps'}
            </Button>
          </div>
        </div>

        {/* Right panel */}
        <APIFromAppsIllustration
          connected={connected}
          generating={generating}
          generatedApi={generatedApi}
          onConnect={handleConnect}
          onGenerate={handleGenerate}
        />
      </div>
    </div>
  );
}
