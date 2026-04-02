'use client';

import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnvSection {
  comment: string;
  vars: { key: string; value: string; secret: boolean }[];
}

interface EnvCopyCardProps {
  sections: EnvSection[];
}

function buildText(sections: EnvSection[]): string {
  return sections
    .map((s) => {
      const lines = [s.comment];
      s.vars.forEach(({ key, value, secret }) => {
        lines.push(`${key}=${secret ? '' : value}`);
      });
      return lines.join('\n');
    })
    .join('\n\n');
}

export function EnvCopyCard({ sections }: EnvCopyCardProps) {
  const [copied, setCopied] = useState(false);

  const text = buildText(sections);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
        <div>
          <p className="text-sm font-medium">Environment template</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Public values included · Secret values left blank
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
            Download .env
          </Button>
          <Button size="sm" className="gap-2" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy all
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Template preview */}
      <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
        <pre className="p-4 text-xs font-mono leading-relaxed text-foreground/90 select-all">
          {sections.map((section, si) => (
            <span key={si}>
              {si > 0 && '\n'}
              <span className="text-muted-foreground">{section.comment}</span>
              {'\n'}
              {section.vars.map(({ key, value, secret }) => (
                <span key={key}>
                  <span className={secret ? 'text-muted-foreground/60' : 'text-foreground'}>
                    {key}
                  </span>
                  <span className="text-muted-foreground/60">=</span>
                  {!secret && value && (
                    <span className="text-emerald-600 dark:text-emerald-400">{value}</span>
                  )}
                  {'\n'}
                </span>
              ))}
            </span>
          ))}
        </pre>
      </div>
    </div>
  );
}
