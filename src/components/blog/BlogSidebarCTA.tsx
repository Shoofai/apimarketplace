import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Compact CTA card rendered in the blog detail sidebar below the TOC.
 * Server component — no interactivity needed.
 */
export function BlogSidebarCTA() {
  return (
    <div className="mt-8 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5">
      <div className="mb-1 flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          LukeAPI
        </p>
      </div>
      <p className="mt-1 text-sm font-medium text-foreground leading-snug">
        Discover 50+ production-ready APIs
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        AI code generation, instant docs, one-click monetization.
      </p>
      <Link href="/marketplace" className="mt-4 block">
        <Button size="sm" variant="outline" className="w-full text-xs">
          Browse marketplace
          <ArrowRight className="ml-1.5 h-3 w-3" />
        </Button>
      </Link>
      <Link href="/signup" className="mt-2 block">
        <Button size="sm" className="w-full text-xs">
          Start for free
        </Button>
      </Link>
    </div>
  );
}
