'use client';

import { useState } from 'react';
import { Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: ignore
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium mr-1">Share:</span>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 gap-1.5"
        asChild
      >
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
          <Twitter className="h-3.5 w-3.5" />
          <span className="text-xs">Twitter</span>
        </a>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 gap-1.5"
        asChild
      >
        <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
          <Linkedin className="h-3.5 w-3.5" />
          <span className="text-xs">LinkedIn</span>
        </a>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 gap-1.5"
        onClick={copyLink}
        aria-label="Copy link"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" />
            <span className="text-xs">Copy link</span>
          </>
        )}
      </Button>
    </div>
  );
}
