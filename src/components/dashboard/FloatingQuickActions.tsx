'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  Box,
  Layers,
  Settings,
  Key,
  TestTube2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingQuickActionsProps {
  user: {
    organizations?: { type?: string } | null;
  };
}

const actions = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/marketplace', icon: Globe, label: 'Marketplace' },
  { href: '/dashboard/provider/apis', icon: Box, label: 'My APIs', providerOnly: true },
  { href: '/dashboard/discover/subscriptions', icon: Layers, label: 'Subscriptions', consumerOnly: true },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { href: '/dashboard/settings/api-keys', icon: Key, label: 'API Keys' },
  { href: '/dashboard/developer/sandbox', icon: TestTube2, label: 'Sandbox' },
  { href: '/dashboard/developer/playground', icon: Zap, label: 'AI Playground' },
];

export function FloatingQuickActions({ user }: FloatingQuickActionsProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const orgType = user.organizations?.type;
  const isProvider = orgType === 'provider' || orgType === 'both';
  const isConsumer = orgType === 'consumer' || orgType === 'both';

  const filtered = actions.filter((a) => {
    if (a.providerOnly && !isProvider) return false;
    if (a.consumerOnly && !isConsumer) return false;
    return true;
  });

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 lg:hidden"
      style={{ marginBottom: 'var(--cookie-banner-height, 0)' }}
    >
      {open && (
        <div className="flex flex-col gap-1 rounded-lg border bg-card p-1 shadow-lg">
          {filtered.map((action) => {
            const Icon = action.icon;
            const isActive = pathname === action.href || (action.href !== '/dashboard' && pathname.startsWith(action.href));
            return (
              <Link key={action.href} href={action.href} onClick={() => setOpen(false)}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start gap-2"
                  aria-label={action.label}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            );
          })}
        </div>
      )}
      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
      >
        <Zap className="h-5 w-5" />
      </Button>
    </div>
  );
}
