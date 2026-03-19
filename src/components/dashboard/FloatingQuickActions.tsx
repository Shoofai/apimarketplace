'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Zap,
  X,
  HelpCircle,
  MessageSquare,
  Ticket,
  Globe,
  BarChart3,
  Code2,
  Box,
  Settings,
  Sparkles,
  FileText,
  Bug,
  Lightbulb,
  Key,
  Layers,
} from 'lucide-react';

interface FloatingQuickActionsProps {
  user: {
    organizations?: { type?: string; plan?: string } | null;
  };
}

interface QuickAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  providerOnly?: boolean;
  consumerOnly?: boolean;
}

const GLOBAL_ACTIONS: QuickAction[] = [
  { label: 'Browse APIs', href: '/marketplace', icon: Globe, description: 'Discover and subscribe to APIs' },
  { label: 'AI Playground', href: '/dashboard/developer/playground', icon: Sparkles, description: 'Generate code with AI' },
  { label: 'My Tickets', href: '/dashboard/tickets', icon: Ticket, description: 'View or create support tickets' },
  { label: 'Help Center', href: '/help', icon: HelpCircle, description: 'Search knowledge base' },
];

function getContextActions(pathname: string): QuickAction[] {
  if (pathname.startsWith('/dashboard/provider')) {
    return [
      { label: 'Provider Analytics', href: '/dashboard/provider/analytics', icon: BarChart3, description: 'View revenue & subscribers' },
      { label: 'Publish API', href: '/dashboard/provider/publish', icon: Box, description: 'Upload OpenAPI spec' },
      { label: 'Provider Docs', href: '/docs', icon: FileText, description: 'Provider guides & resources' },
    ];
  }
  if (pathname.startsWith('/dashboard/developer')) {
    return [
      { label: 'API Builder', href: '/dashboard/developer', icon: Code2, description: 'Build & test integrations' },
      { label: 'Sandbox', href: '/dashboard/developer/sandbox', icon: Bug, description: 'Test APIs safely' },
      { label: 'API Keys', href: '/dashboard/settings/api-keys', icon: Key, description: 'Manage API keys' },
    ];
  }
  if (pathname.startsWith('/dashboard/analytics')) {
    return [
      { label: 'Usage Metrics', href: '/dashboard/analytics', icon: BarChart3, description: 'API call analytics' },
      { label: 'Cost Optimizer', href: '/dashboard/analytics/costs', icon: Settings, description: 'Optimize API spend' },
    ];
  }
  if (pathname.startsWith('/marketplace')) {
    return [
      { label: 'Compare APIs', href: '/marketplace/compare', icon: BarChart3, description: 'Side-by-side comparison' },
      { label: 'AI Playground', href: '/dashboard/developer/playground', icon: Sparkles, description: 'Generate integration code' },
      { label: 'Subscriptions', href: '/dashboard/discover/subscriptions', icon: Layers, description: 'Manage subscriptions', consumerOnly: true },
    ];
  }
  if (pathname.startsWith('/dashboard/forum')) {
    return [
      { label: 'Report Bug', href: '/dashboard/forum?category=bug-reports', icon: Bug, description: 'Report an issue' },
      { label: 'Feature Request', href: '/dashboard/forum?category=feature-requests', icon: Lightbulb, description: 'Suggest improvements' },
    ];
  }
  if (pathname.startsWith('/dashboard/settings')) {
    return [
      { label: 'Security', href: '/dashboard/settings/security', icon: Settings, description: 'MFA & security settings' },
      { label: 'API Keys', href: '/dashboard/settings/api-keys', icon: Key, description: 'Manage API keys' },
    ];
  }
  return [
    { label: 'Forum', href: '/dashboard/forum', icon: MessageSquare, description: 'Community discussions' },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Usage & performance' },
  ];
}

export function FloatingQuickActions({ user }: FloatingQuickActionsProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const orgType = user.organizations?.type;
  const isProvider = orgType === 'provider' || orgType === 'both';
  const isConsumer = orgType === 'consumer' || orgType === 'both';

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const contextActions = getContextActions(pathname);
  const contextHrefs = new Set(contextActions.map((a) => a.href));
  const allActions = [
    ...contextActions,
    ...GLOBAL_ACTIONS.filter((a) => !contextHrefs.has(a.href)),
  ]
    .filter((a) => {
      if (a.providerOnly && !isProvider) return false;
      if (a.consumerOnly && !isConsumer) return false;
      return true;
    })
    .slice(0, 6);

  return (
    <div
      ref={menuRef}
      className="fixed bottom-6 right-6 z-50"
      style={{
        marginBottom:
          'max(var(--cookie-banner-height, 0px), env(safe-area-inset-bottom, 0px))',
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Quick Actions
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto py-1">
              {allActions.map((action) => {
                const Icon = action.icon;
                const isActive =
                  pathname === action.href ||
                  (action.href !== '/dashboard' && pathname.startsWith(action.href));
                return (
                  <Link
                    key={action.href + action.label}
                    href={action.href}
                    className={`flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      isActive ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-gray-100 px-4 py-2.5 dark:border-gray-800">
              <Link
                href="/contact"
                className="flex items-center gap-2 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                onClick={() => setOpen(false)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Contact Support
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
          open
            ? 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200'
            : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-xl dark:bg-primary-500 dark:hover:bg-primary-600'
        }`}
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Zap className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
