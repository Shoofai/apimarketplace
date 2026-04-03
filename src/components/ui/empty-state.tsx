import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actions?: EmptyStateAction[];
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, actions, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 px-8 py-16 text-center', className)}>
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Icon className="h-7 w-7 text-muted-foreground/60" />
        </div>
      )}
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {actions.map((action, i) => {
            const btn = (
              <Button
                key={i}
                variant={action.variant ?? (i === 0 ? 'default' : 'outline')}
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            );
            return action.href ? (
              <Link key={i} href={action.href}>{btn}</Link>
            ) : btn;
          })}
        </div>
      )}
    </div>
  );
}
