'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerateAPIButtonProps {
  connected: boolean;
  generating: boolean;
  onGenerate: () => void;
}

export default function GenerateAPIButton({
  connected,
  generating,
  onGenerate,
}: GenerateAPIButtonProps) {
  return (
    <Button
      variant="cta"
      size="lg"
      className="w-full shadow-glow-cta transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 hover:scale-[1.02] hover:shadow-[0_0_28px_-4px_rgba(251,191,36,0.45)] disabled:pointer-events-none disabled:hover:scale-100"
      disabled={!connected}
      onClick={onGenerate}
    >
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating…
        </>
      ) : (
        'Generate API'
      )}
    </Button>
  );
}
