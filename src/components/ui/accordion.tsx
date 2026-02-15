'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type AccordionContextValue = {
  openValues: string[];
  toggle: (value: string) => void;
  type: 'single' | 'multiple';
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const AccordionItemContext = React.createContext<string | null>(null);

function useAccordion() {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error('Accordion components must be used within Accordion');
  return ctx;
}

function useAccordionItem() {
  const value = React.useContext(AccordionItemContext);
  if (value == null) throw new Error('AccordionTrigger/Content must be used within AccordionItem');
  return value;
}

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = 'single', defaultValue, className, children, ...props }, ref) => {
    const initial = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
    const [openValues, setOpenValues] = React.useState<string[]>(initial);

    const toggle = React.useCallback(
      (value: string) => {
        setOpenValues((prev) => {
          const has = prev.includes(value);
          if (type === 'single') return has ? [] : [value];
          return has ? prev.filter((v) => v !== value) : [...prev, value];
        });
      },
      [type]
    );

    return (
      <AccordionContext.Provider value={{ openValues, toggle, type }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = 'Accordion';

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children, ...props }, ref) => (
    <AccordionItemContext.Provider value={value}>
      <div
        ref={ref}
        data-state=""
        className={cn('border-b border-border last:border-b-0', className)}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
);
AccordionItem.displayName = 'AccordionItem';

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useAccordion();
    const value = useAccordionItem();
    const isOpen = ctx.openValues.includes(value);

    return (
      <div className="flex">
        <button
          ref={ref}
          type="button"
          aria-expanded={isOpen}
          className={cn(
            'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:no-underline hover:opacity-90 [&>svg]:transition-transform duration-200',
            isOpen && '[&>svg]:rotate-180',
            className
          )}
          onClick={() => ctx.toggle(value)}
          {...props}
        >
          {children}
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </div>
    );
  }
);
AccordionTrigger.displayName = 'AccordionTrigger';

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useAccordion();
    const value = useAccordionItem();
    const isOpen = ctx.openValues.includes(value);

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={cn('overflow-hidden text-sm pb-4 pt-0', className)}
        data-state={isOpen ? 'open' : 'closed'}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
