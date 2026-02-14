'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, AlertTriangle } from 'lucide-react';

interface APIKeyRevealProps {
  apiKey: string;
  apiName: string;
  onDone?: () => void;
}

export function APIKeyReveal({ apiKey, apiName, onDone }: APIKeyRevealProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Save this API key now. It will not be shown again for security reasons.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Your API Key</label>
        <div className="flex gap-2">
          <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono break-all">
            {apiKey}
          </code>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Use this key in the Authorization header when calling {apiName}.
      </div>

      {onDone && (
        <Button className="w-full" onClick={onDone}>
          Done
        </Button>
      )}
    </div>
  );
}
