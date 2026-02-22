'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface AdminSectionTab {
  label: string;
  href: string;
}

export function AdminSectionTabs({
  tabs,
  basePath,
}: {
  tabs: AdminSectionTab[];
  basePath: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center gap-1 rounded-lg bg-muted p-1 text-muted-foreground mb-6"
      aria-label="Section tabs"
    >
      {tabs.map(({ label, href }) => {
        const isActive =
          pathname === href ||
          (pathname.startsWith(href + '/') && href.startsWith(basePath));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive
                ? 'bg-background text-foreground shadow'
                : 'hover:bg-background/60 hover:text-foreground'
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
