'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from './MarkdownRenderer';

// ── Content splitting ──────────────────────────────────────────────────────────

/** Split markdown at the nearest paragraph break after ~40% of total length. */
function splitContent(content: string): [string, string] {
  const target = Math.floor(content.length * 0.4);
  const splitAt = content.indexOf('\n\n', target);
  // Don't split if no break found, or it's in the last 15% (would feel odd)
  if (splitAt === -1 || splitAt > content.length * 0.85) {
    return [content, ''];
  }
  return [content.slice(0, splitAt).trim(), content.slice(splitAt).trim()];
}

// ── Mid-post inline CTA ────────────────────────────────────────────────────────

function InlineCTA({ categorySlug }: { categorySlug: string | null }) {
  const slug = categorySlug ?? '';

  if (slug.includes('enterprise') || slug.includes('buying')) {
    return (
      <div className="my-10 rounded-xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 not-prose">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">Enterprise API Governance</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            See how LukeAPI handles compliance, audit trails, and team access controls at scale.
          </p>
        </div>
        <Link href="/contact" className="shrink-0">
          <Button size="sm" className="whitespace-nowrap">
            Talk to our team <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    );
  }

  if (slug.includes('comparison') || slug.includes('competitive') || slug.includes('vs')) {
    return (
      <div className="my-10 rounded-xl border border-border bg-muted/50 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 not-prose">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">See LukeAPI in action</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse 50+ APIs, generate integration code in seconds, and go live without the lock-in.
          </p>
        </div>
        <Link href="/marketplace" className="shrink-0">
          <Button size="sm" variant="outline" className="whitespace-nowrap">
            Browse marketplace <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    );
  }

  // Default: developer-focused
  return (
    <div className="my-10 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 not-prose">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">Start building with 50+ APIs</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          Free tier included. AI-generated code, one-click integration, no credit card required.
        </p>
      </div>
      <Link href="/signup" className="shrink-0">
        <Button size="sm" className="whitespace-nowrap">
          <Zap className="mr-1.5 h-3.5 w-3.5" />
          Start for free
        </Button>
      </Link>
    </div>
  );
}

// ── Gate overlay ───────────────────────────────────────────────────────────────

function GateOverlay() {
  return (
    <div className="paywall-gate relative">
      {/* Gate card */}
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Continue reading for free
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Create a free LukeAPI account to unlock this article and all member-only content.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup">
            <Button className="w-full sm:w-auto">Create free account</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full sm:w-auto">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface ArticleBodyProps {
  content: string;
  accessLevel: 'public' | 'registered';
  isAuthenticated: boolean;
  categorySlug: string | null;
}

export function ArticleBody({
  content,
  accessLevel,
  isAuthenticated,
  categorySlug,
}: ArticleBodyProps) {
  const isGated = accessLevel === 'registered' && !isAuthenticated;
  const [firstHalf, secondHalf] = useMemo(() => splitContent(content), [content]);

  if (isGated) {
    // Full content is rendered in the DOM for SEO — the gate is purely visual.
    // The max-height container clips what the user sees; Googlebot reads the whole thing.
    return (
      <div>
        {/* Clipped content — full HTML in DOM */}
        <div className="relative overflow-hidden" style={{ maxHeight: '580px' }}>
          <MarkdownRenderer content={content} />
          {/* Fade-out gradient */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent via-background/80 to-background" />
        </div>

        {/* Visual gate */}
        <GateOverlay />
      </div>
    );
  }

  // Public or authenticated — render with mid-post CTA injected
  return (
    <div>
      <MarkdownRenderer content={firstHalf} />
      {secondHalf && (
        <>
          <InlineCTA categorySlug={categorySlug} />
          <MarkdownRenderer content={secondHalf} />
        </>
      )}
    </div>
  );
}
