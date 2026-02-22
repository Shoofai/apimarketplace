'use client';

import { cn } from '@/lib/utils';
import {
  Activity,
  BarChart3,
  Box,
  Crown,
  Settings,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  activity: Activity,
  'bar-chart-3': BarChart3,
  box: Box,
  crown: Crown,
  settings: Settings,
};

export type PageHeaderIconName = keyof typeof ICON_MAP;

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  /** Icon name (serializable). Use when PageHeader is rendered from a Server Component. */
  icon?: PageHeaderIconName;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon: iconName, leading, actions, className }: PageHeaderProps) {
  const Icon = iconName ? ICON_MAP[iconName] : undefined;
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div className="flex items-center gap-4">
        {leading}
        <div>
          <h1 className="page-title flex items-center gap-2 mb-2">
            {Icon && <Icon className="h-7 w-7 shrink-0 text-primary" />}
            {title}
          </h1>
          {description && (
            <div className={typeof description === 'string' ? 'text-muted-foreground' : ''}>
              {description}
            </div>
          )}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
