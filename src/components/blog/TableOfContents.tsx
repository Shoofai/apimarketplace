'use client';

import { useEffect, useState, useRef } from 'react';
import { headingToId } from '@/lib/blog/heading-id';

interface Heading {
  level: number;
  text: string;
  id: string;
}

function parseHeadings(content: string): Heading[] {
  const matches = Array.from(content.matchAll(/^(#{2,3}) (.+)$/gm));
  return matches.map((m) => ({
    level: m[1].length,
    text: m[2].trim(),
    id: headingToId(m[2].trim()),
  }));
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = parseHeadings(content);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length < 3) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    );

    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [headings.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (headings.length < 3) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="hidden lg:block sticky top-24 space-y-1 text-sm"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-1">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? '0.75rem' : '0' }}>
            <a
              href={`#${h.id}`}
              className={`block truncate rounded py-1 px-2 transition-colors hover:text-foreground ${
                activeId === h.id
                  ? 'text-primary font-medium bg-primary/5'
                  : 'text-muted-foreground'
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                setActiveId(h.id);
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
