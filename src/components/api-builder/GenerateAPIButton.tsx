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
      className="w-full shadow-glow-cta transition-shadow hover:shadow-lg"
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
