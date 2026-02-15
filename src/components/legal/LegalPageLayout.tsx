import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LegalTOC } from './LegalTOC';

export interface TocItem {
  id: string;
  label: string;
}

interface LegalPageLayoutProps {
  title: string;
  version: string;
  lastUpdated: string;
  tocItems: TocItem[];
  children: React.ReactNode;
  /** Optional action (e.g. Cookie Settings button) to show in header */
  headerAction?: React.ReactNode;
}

export function LegalPageLayout({
  title,
  version,
  lastUpdated,
  tocItems,
  children,
  headerAction,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          {headerAction}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
          {/* Sidebar TOC - Desktop: sticky left; Mobile: above content */}
          <aside className="lg:order-first">
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
              <div className="rounded-lg border border-border bg-card p-4 lg:p-4">
                <LegalTOC items={tocItems} />
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0">
            <article className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:scroll-mt-28 prose-h1:text-4xl prose-h1:font-bold prose-h1:tracking-tight prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-3 prose-h2:pt-2 prose-h2:border-b prose-h2:border-border prose-h2:text-2xl prose-h2:font-semibold prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-xl prose-h3:font-medium prose-p:my-5 prose-p:leading-relaxed prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-4 prose-li:list-item prose-blockquote:my-6 prose-blockquote:rounded-r-lg prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:py-3 prose-blockquote:pr-4 prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:font-normal prose-blockquote:text-foreground prose-table:my-8">
              <h1>{title}</h1>
              <p className="text-muted-foreground text-base -mt-2 mb-8">
                <span className="rounded-md bg-muted px-2 py-0.5 text-sm font-medium">
                  {version}
                </span>
                <span className="mx-2">·</span>
                <span>Last Updated: {lastUpdated}</span>
              </p>

              {children}
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}
