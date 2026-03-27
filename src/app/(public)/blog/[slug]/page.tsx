import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import matter from 'gray-matter';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { Metadata } from 'next';

interface BlogPost {
  slug: string;
  title: string;
  category: string;
  order: number;
  image?: string;
  publishedAt: string;
  author?: string;
  content: string;
}

function getPost(slug: string): BlogPost | null {
  const contentDir = resolve(process.cwd(), 'content/blog');
  const extensions = ['.mdx', '.md'];
  for (const ext of extensions) {
    try {
      const filePath = resolve(contentDir, `${slug}${ext}`);
      const raw = readFileSync(filePath, 'utf-8');
      const { data, content } = matter(raw);
      return {
        slug,
        title: data.title || slug,
        category: data.category || 'General',
        order: data.order || 0,
        image: data.image,
        publishedAt: data.publishedAt || '',
        author: data.author,
        content,
      };
    } catch {
      continue;
    }
  }
  return null;
}

function getAllSlugs(): string[] {
  const contentDir = resolve(process.cwd(), 'content/blog');
  try {
    return readdirSync(contentDir)
      .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
      .map((f) => f.replace(/\.mdx?$/, ''));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} | LukeAPI Blog`,
    description: post.content.slice(0, 160).replace(/\n/g, ' '),
  };
}

function simpleMarkdownToHtml(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br />');

  // Wrap list items
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  // Clean up duplicate ul tags
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  return `<p>${html}</p>`;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  const allSlugs = getAllSlugs();
  const currentIdx = allSlugs.indexOf(slug);
  const prevSlug = currentIdx > 0 ? allSlugs[currentIdx - 1] : null;
  const nextSlug = currentIdx < allSlugs.length - 1 ? allSlugs[currentIdx + 1] : null;

  const htmlContent = simpleMarkdownToHtml(post.content);

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>

      {/* Hero image */}
      {post.image && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-xl sm:h-96">
          <Image src={post.image} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      {/* Meta */}
      <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <Tag className="h-4 w-4" />
          {post.category}
        </span>
        {post.publishedAt && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        )}
        {post.author && (
          <span className="inline-flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {post.author}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="mb-8 font-heading text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
        {post.title}
      </h1>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-a:text-primary-600 dark:prose-a:text-primary-400"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Prev/Next navigation */}
      <div className="mt-16 flex items-center justify-between border-t border-gray-200 pt-8 dark:border-gray-800">
        {prevSlug ? (
          <Link
            href={`/blog/${prevSlug}`}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
          >
            Previous article
          </Link>
        ) : (
          <div />
        )}
        {nextSlug ? (
          <Link
            href={`/blog/${nextSlug}`}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
          >
            Next article
          </Link>
        ) : (
          <div />
        )}
      </div>
    </article>
  );
}
