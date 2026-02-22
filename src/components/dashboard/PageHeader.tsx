import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon: Icon, leading, actions, className }: PageHeaderProps) {
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
