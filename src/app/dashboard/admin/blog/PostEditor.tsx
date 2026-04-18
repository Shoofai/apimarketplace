'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';
import { slugify, estimateReadingTime } from '@/lib/blog/utils';
import { Loader2 } from 'lucide-react';
import type { BlogPost } from './page';

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(500)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  content: z.string().optional().nullable(),
  excerpt: z.string().max(500).optional().nullable(),
  category_id: z.string().optional().nullable(),
  author_name: z.string().max(200).optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  featured: z.boolean(),
  access_level: z.enum(['public', 'registered']),
  tags_raw: z.string().optional(), // comma-separated tags
  meta_title: z.string().max(200).optional().nullable(),
  meta_description: z.string().max(500).optional().nullable(),
  featured_image_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = { id: string; name: string; slug: string };

interface PostEditorProps {
  /** null = create new; BlogPost = edit existing */
  post: BlogPost | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (post: BlogPost) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PostEditor({ post, categories, onClose, onSaved }: PostEditorProps) {
  const isEdit = post !== null;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      content: post?.content ?? '',
      excerpt: post?.excerpt ?? '',
      category_id: post?.category_id ?? '',
      author_name: post?.author_name ?? 'LukeAPI Team',
      status: (post?.status as 'draft' | 'published' | 'archived') ?? 'draft',
      featured: post?.featured ?? false,
      access_level: ((post as any)?.access_level as 'public' | 'registered') ?? 'public',
      tags_raw: (post as any)?.tags?.join(', ') ?? '',
      meta_title: (post as any)?.meta_title ?? '',
      meta_description: (post as any)?.meta_description ?? '',
      featured_image_url: (post as any)?.featured_image_url ?? '',
    },
  });

  const watchedTitle = watch('title');
  const watchedContent = watch('content') ?? '';
  const watchedFeatured = watch('featured');
  const watchedStatus = watch('status');
  const watchedAccessLevel = watch('access_level');

  const estimatedReadingTime = estimateReadingTime(watchedContent);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setValue('title', value);
    // Auto-slug only on create, not edit
    if (!isEdit) {
      setValue('slug', slugify(value));
    }
  }

  async function onSubmit(values: FormValues) {
    setSaving(true);
    setError(null);

    try {
      const tags = values.tags_raw
        ? values.tags_raw
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : null;

      const payload = {
        title: values.title,
        slug: values.slug,
        content: values.content || null,
        excerpt: values.excerpt || null,
        category_id: values.category_id || null,
        author_name: values.author_name || null,
        status: values.status,
        featured: values.featured,
        access_level: values.access_level,
        tags,
        meta_title: values.meta_title || null,
        meta_description: values.meta_description || null,
        featured_image_url: values.featured_image_url || null,
        reading_time_minutes: estimatedReadingTime,
      };

      const url = isEdit ? `/api/admin/blog/${post!.id}` : '/api/admin/blog';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Request failed (${res.status})`);
      }

      const saved = await res.json();

      // Normalise returned data to match BlogPost shape
      const catRaw = saved.blog_categories;
      const category_name = Array.isArray(catRaw)
        ? (catRaw[0]?.name ?? null)
        : (catRaw?.name ?? null);

      onSaved({
        id: saved.id,
        title: saved.title,
        slug: saved.slug,
        status: saved.status,
        published_at: saved.published_at ?? null,
        created_at: saved.created_at ?? post?.created_at ?? null,
        featured: saved.featured ?? false,
        view_count: saved.view_count ?? post?.view_count ?? null,
        category_id: saved.category_id ?? null,
        category_name,
        content: saved.content ?? null,
        excerpt: saved.excerpt ?? null,
        author_name: saved.author_name ?? null,
        tags: saved.tags ?? null,
        meta_title: saved.meta_title ?? null,
        meta_description: saved.meta_description ?? null,
        featured_image_url: saved.featured_image_url ?? null,
      } as BlogPost);

      onClose();
    } catch (e: any) {
      setError(e.message ?? 'An error occurred');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit: ${post!.title.slice(0, 60)}` : 'New Blog Post'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="edit">
            <TabsList className="mb-4">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* ── Edit tab ── */}
            <TabsContent value="edit" className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  onChange={handleTitleChange}
                  placeholder="How to Build a Production-Ready API in 5 Minutes"
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder="how-to-build-a-production-ready-api"
                  className="font-mono text-sm"
                />
                {errors.slug && (
                  <p className="text-xs text-destructive">{errors.slug.message}</p>
                )}
              </div>

              {/* Category + Status row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    defaultValue={post?.category_id ?? ''}
                    onValueChange={(v) => setValue('category_id', v || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No category</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    defaultValue={watchedStatus}
                    onValueChange={(v) => setValue('status', v as 'draft' | 'published' | 'archived')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Author + Featured row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="author_name">Author</Label>
                  <Input id="author_name" {...register('author_name')} placeholder="LukeAPI Team" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    id="featured"
                    checked={watchedFeatured}
                    onCheckedChange={(v) => setValue('featured', v)}
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Featured post
                  </Label>
                </div>
              </div>

              {/* Access level */}
              <div className="space-y-1.5">
                <Label>Access level</Label>
                <Select
                  defaultValue={watchedAccessLevel}
                  onValueChange={(v) => setValue('access_level', v as 'public' | 'registered')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">🌐 Public — visible to everyone</SelectItem>
                    <SelectItem value="registered">🔒 Members only — free account required</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Members-only posts show full content in the HTML (for SEO) but display a sign-up gate to signed-out visitors.
                </p>
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  {...register('excerpt')}
                  placeholder="A brief summary that appears in list views and meta tags…"
                  rows={2}
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content (Markdown)</Label>
                  <span className="text-xs text-muted-foreground">
                    ~{estimatedReadingTime} min read
                  </span>
                </div>
                <Textarea
                  id="content"
                  {...register('content')}
                  placeholder="Write your article in Markdown…"
                  className="min-h-[400px] font-mono text-sm leading-relaxed"
                />
              </div>

              {/* Featured image */}
              <div className="space-y-1.5">
                <Label htmlFor="featured_image_url">Featured Image URL</Label>
                <Input
                  id="featured_image_url"
                  {...register('featured_image_url')}
                  placeholder="https://..."
                  type="url"
                />
                {errors.featured_image_url && (
                  <p className="text-xs text-destructive">{errors.featured_image_url.message}</p>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <Label htmlFor="tags_raw">Tags</Label>
                <Input
                  id="tags_raw"
                  {...register('tags_raw')}
                  placeholder="api, monetization, developer-experience"
                />
                <p className="text-xs text-muted-foreground">Comma-separated</p>
              </div>

              {/* SEO */}
              <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">SEO (optional)</p>
                <div className="space-y-1.5">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    {...register('meta_title')}
                    placeholder="Defaults to post title"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    {...register('meta_description')}
                    placeholder="Defaults to excerpt"
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>

            {/* ── Preview tab ── */}
            <TabsContent value="preview">
              <div className="rounded-lg border border-border bg-background p-6 min-h-[400px]">
                {watchedContent ? (
                  <>
                    <h1 className="text-2xl font-bold text-foreground mb-6">
                      {watchedTitle || 'Untitled'}
                    </h1>
                    <MarkdownRenderer content={watchedContent} />
                  </>
                ) : (
                  <p className="text-muted-foreground italic">
                    Start writing in the Edit tab to see a preview here.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-4 py-2">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : isEdit ? (
                'Save changes'
              ) : (
                'Create post'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
