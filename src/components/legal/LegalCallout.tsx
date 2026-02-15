import { ReactNode } from 'react';

type Variant = 'info' | 'warning' | 'muted';

interface LegalCalloutProps {
  children: ReactNode;
  variant?: Variant;
  /** Optional short label (e.g. "Important") */
  title?: string;
}

const variantStyles: Record<Variant, string> = {
  info: 'border-l-primary bg-primary/5 dark:bg-primary/10',
  warning: 'border-l-amber-500 bg-amber-500/5 dark:bg-amber-500/10',
  muted: 'border-l-muted-foreground/40 bg-muted/30 dark:bg-muted/20',
};

export function LegalCallout({ children, variant = 'info', title }: LegalCalloutProps) {
  return (
    <div
      className={`my-6 rounded-r-lg border-l-4 py-4 pr-5 pl-5 ${variantStyles[variant]}`}
      role="note"
    >
      {title && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      )}
      <div className="text-base leading-relaxed [&>p]:my-2 [&>p:last-child]:mb-0 [&>ul]:my-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>li]:my-0.5">
        {children}
      </div>
    </div>
  );
}
