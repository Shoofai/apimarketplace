import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import Link from 'next/link';
import Image from 'next/image';
import matter from 'gray-matter';
import { ArrowRight } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Blog | ${name}`,
    description: `News, tutorials, and product updates from the ${name} team.`,
  };
}

interface BlogPost {
  slug: string;
  title: string;
  category: string;
  order: number;
  image?: string;
  publishedAt: string;
  author?: string;
  excerpt?: string;
}

function getBlogPosts(): BlogPost[] {
  const contentDir = resolve(process.cwd(), 'content/blog');
  try {
    const files = readdirSync(contentDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
    return files
      .map((file) => {
        const raw = readFileSync(resolve(contentDir, file), 'utf-8');
        const { data, content } = matter(raw);
        const excerpt = content.replace(/^#.+$/m, '').trim().slice(0, 160).replace(/\n/g, ' ') + '...';
        return {
          slug: data.slug || file.replace(/\.mdx?$/, ''),
          title: data.title || file.replace(/\.mdx?$/, ''),
          category: data.category || 'General',
          order: data.order || 0,
          image: data.image,
          publishedAt: data.publishedAt || '',
          author: data.author,
          excerpt,
        };
      })
      .sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Blog
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Insights, tutorials, and updates from the LukeAPI team
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            No blog posts yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              {post.image && (
                <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {post.category}
                  </span>
                  {post.publishedAt && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <h2 className="mb-2 font-heading text-lg font-bold text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400">
                  Read more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
