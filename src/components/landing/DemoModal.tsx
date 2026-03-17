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
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
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
          <div className="flex flex-col bg-gray-950 text-white p-8 sm:p-10">
            <DialogHeader className="not-sr-only mb-6">
              <DialogTitle className="text-2xl font-bold text-white">See the platform in action</DialogTitle>
              <p className="mt-1 text-sm text-gray-400">A guided tour of the 4 core workflows — takes 2 minutes.</p>
            </DialogHeader>
            <ol className="space-y-4">
              {[
                { step: '01', title: 'Discover APIs', desc: 'Browse 1,000+ APIs by category, rating, and pricing model.', href: '/marketplace', cta: 'Open Marketplace' },
                { step: '02', title: 'Test in Playground', desc: 'Send live requests to any API before subscribing — no code required.', href: '/dashboard/playground', cta: 'Open Playground' },
                { step: '03', title: 'Publish & Monetize', desc: 'Upload your OpenAPI spec and start billing consumers in minutes.', href: '/dashboard/apis/publish', cta: 'Publish an API' },
                { step: '04', title: 'Track Revenue & Usage', desc: 'See call volumes, revenue, cost trends, and alerts in one dashboard.', href: '/dashboard/analytics', cta: 'View Analytics' },
              ].map(({ step, title, desc, href, cta }) => (
                <li key={step} className="flex items-start gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
                  <span className="shrink-0 text-xs font-black text-primary-400">{step}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white">{title}</div>
                    <div className="mt-0.5 text-sm text-gray-400">{desc}</div>
                  </div>
                  <Link
                    href={href}
                    onClick={() => onOpenChange(false)}
                    className="shrink-0 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 transition-colors"
                  >
                    {cta}
                  </Link>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex justify-end">
              <Link
                href="/start"
                onClick={() => onOpenChange(false)}
                className="rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Get started free →
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
