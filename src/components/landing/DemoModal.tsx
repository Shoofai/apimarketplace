'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';

// Replace with your actual demo video URL when available
const DEMO_VIDEO_URL = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL || '';

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="aspect-video max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>2-Minute Platform Demo</DialogTitle>
        </DialogHeader>
        {DEMO_VIDEO_URL ? (
          <div className="aspect-video w-full">
            <iframe
              src={DEMO_VIDEO_URL}
              title="Platform Demo"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-muted/50 p-8 text-center">
            <p className="text-lg font-medium">Demo video coming soon</p>
            <p className="text-sm text-muted-foreground">
              Explore our API marketplace to see the platform in action.
            </p>
            <Link
              href="/marketplace"
              className="text-primary underline underline-offset-4 hover:no-underline"
              onClick={() => onOpenChange(false)}
            >
              Browse APIs →
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
