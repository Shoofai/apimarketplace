import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, FileText } from 'lucide-react';

export interface PostCardData {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  author_name: string | null;
  reading_time_minutes: number | null;
  featured?: boolean;
  category: { name: string; slug: string } | null;
}

interface PostCardProps {
  post: PostCardData;
  /** Renders the card larger (for featured/hero slots) */
  large?: boolean;
}

export function PostCard({ post, large = false }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={`relative w-full overflow-hidden bg-muted ${large ? 'h-56' : 'h-44'}`}>
        {post.featured_image_url ? (
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes={large ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/5 via-muted to-accent/10">
            <div className="rounded-xl bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary/50" />
            </div>
            {post.category && (
              <span className="text-xs font-medium text-muted-foreground/70">
                {post.category.name}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="p-6">
        {/* Category + date */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {post.category && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {post.category.name}
            </span>
          )}
          {post.published_at && (
            <span className="text-xs text-muted-foreground">
              {new Date(post.published_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
          {post.reading_time_minutes && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {post.reading_time_minutes} min read
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          className={`mb-2 font-bold text-foreground group-hover:text-primary transition-colors leading-snug ${
            large ? 'text-xl' : 'text-lg'
          }`}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
        )}

        {/* Author + CTA */}
        <div className="flex items-center justify-between">
          {post.author_name && (
            <span className="text-xs text-muted-foreground">{post.author_name}</span>
          )}
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary ml-auto">
            Read more
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
