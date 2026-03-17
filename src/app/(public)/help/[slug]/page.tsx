import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { getArticleBySlug, getArticlesByCategory, HELP_ARTICLES } from '@/lib/help/articles';
import { ArrowLeft, MessageCircle, BookOpen } from 'lucide-react';

export async function generateStaticParams() {
  return HELP_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  const name = await getPlatformName();
  if (!article) return { title: `Help | ${name}` };
  return {
    title: `${article.title} | Help Center | ${name}`,
    description: article.summary,
  };
}

/** Very lightweight markdown-to-HTML renderer for controlled article content */
function renderMarkdown(md: string): string {
  return md
    // Fenced code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre class="my-4 overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 text-sm font-mono"><code>${escaped}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">$1</code>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="mt-8 mb-3 text-xl font-semibold text-foreground border-b border-border pb-2">$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="mt-6 mb-2 text-base font-semibold text-foreground">$1</h3>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Table rows (simple 3-col)
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split('|').map((c: string) => c.trim());
      const isHeader = cells.every((c: string) => c.length > 0);
      const tag = isHeader ? 'th' : 'td';
      return `<tr>${cells.map((c: string) => `<${tag} class="border border-border px-3 py-2 text-sm">${c}</${tag}>`).join('')}</tr>`;
    })
    // Wrap consecutive table rows in a table
    .replace(/((?:<tr>.*?<\/tr>\n?){2,})/g, '<div class="my-4 overflow-x-auto"><table class="w-full border-collapse">$1</table></div>')
    // Separator rows (|----|)
    .replace(/^\|[-| :]+\|$/gm, '')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-muted-foreground">$1</li>')
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc text-muted-foreground">$1</li>')
    // Wrap consecutive li's in ul
    .replace(/((?:<li[^>]*>.*?<\/li>\n?){2,})/g, '<ul class="my-3 space-y-1">$1</ul>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-6 border-border" />')
    // Links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
    // Paragraphs (blank-line delimited)
    .replace(/\n{2,}/g, '\n\n')
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      // Don't wrap already-tagged blocks
      if (/^<(h[1-6]|ul|ol|pre|div|hr|table)/.test(trimmed)) return trimmed;
      return `<p class="text-muted-foreground leading-7">${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');
}

export default async function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = getArticlesByCategory(article.category).filter((a) => a.slug !== article.slug).slice(0, 3);
  const html = renderMarkdown(article.body);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        {/* Back link */}
        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Help Center
        </Link>

        {/* Article header */}
        <header className="mb-8">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">
            {article.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {article.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{article.summary}</p>
        </header>

        {/* Article body */}
        <article
          className="prose-like"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Related articles */}
        {related.length > 0 && (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="text-base font-semibold mb-4">Related articles</h2>
            <div className="space-y-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/help/${r.slug}`}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors group"
                >
                  <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Still need help? */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <MessageCircle className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Still need help?</p>
            <p className="text-sm text-muted-foreground">Our support team is happy to assist.</p>
          </div>
          <Link
            href="/contact"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
