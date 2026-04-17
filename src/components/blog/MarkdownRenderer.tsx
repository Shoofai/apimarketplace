'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { headingToId } from '@/lib/blog/heading-id';
import type { Components } from 'react-markdown';
import type { ReactNode } from 'react';

function childrenToString(children: ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(childrenToString).join('');
  if (children && typeof children === 'object' && 'props' in (children as any)) {
    return childrenToString((children as any).props?.children);
  }
  return String(children ?? '');
}

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    if (match) {
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={{ borderRadius: '0.5rem', fontSize: '0.875rem' }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    }
    return (
      <code
        className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
        {...props}
      >
        {children}
      </code>
    );
  },

  h2({ children }) {
    const id = headingToId(childrenToString(children));
    return <h2 id={id}>{children}</h2>;
  },
  h3({ children }) {
    const id = headingToId(childrenToString(children));
    return <h3 id={id}>{children}</h3>;
  },
  h4({ children }) {
    const id = headingToId(childrenToString(children));
    return <h4 id={id}>{children}</h4>;
  },

  table({ children }) {
    return (
      <div className="overflow-x-auto my-6">
        <table>{children}</table>
      </div>
    );
  },

  a({ href, children }) {
    const isExternal = href?.startsWith('http');
    return (
      <a
        href={href}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  },

  img({ src, alt }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ''}
        className="rounded-lg my-6 max-w-full h-auto"
        loading="lazy"
      />
    );
  },
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div
      className={`prose prose-lg max-w-none dark:prose-invert prose-a:text-primary prose-headings:text-foreground prose-pre:bg-muted prose-pre:p-0 prose-img:rounded-lg ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
