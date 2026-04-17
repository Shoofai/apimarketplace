'use client';

import { useState, useTransition, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/dashboard/PageHeader';
import {
  Globe,
  FileText,
  Star,
  Eye,
  ChevronUp,
  ChevronDown,
  Filter,
  CheckSquare,
  Square,
  Send,
  EyeOff,
  Archive,
  ExternalLink,
  PenSquare,
  Pencil,
} from 'lucide-react';
import type { BlogPost } from './page';
import { PostEditor } from './PostEditor';

type Category = { id: string; name: string; slug: string };
type SortKey = 'created_at' | 'title' | 'status' | 'view_count';
type SortDir = 'asc' | 'desc';

interface Props {
  initialPosts: BlogPost[];
  categories: Category[];
}

export function BlogAdminClient({ initialPosts, categories }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  // Editor state: null = closed, 'new' = create, BlogPost = edit
  const [editorState, setEditorState] = useState<'new' | BlogPost | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Feedback
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // Filtered + sorted posts
  const visible = useMemo(() => {
    let result = posts;
    if (statusFilter !== 'all') result = result.filter((p) => p.status === statusFilter);
    if (categoryFilter !== 'all') result = result.filter((p) => p.category_id === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.category_name ?? '').toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortKey === 'created_at') { av = a.created_at ?? ''; bv = b.created_at ?? ''; }
      else if (sortKey === 'title') { av = a.title; bv = b.title; }
      else if (sortKey === 'status') { av = a.status; bv = b.status; }
      else if (sortKey === 'view_count') { av = a.view_count ?? 0; bv = b.view_count ?? 0; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [posts, statusFilter, categoryFilter, search, sortKey, sortDir]);

  const visibleIds = visible.map((p) => p.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  // Single-post toggle
  async function togglePost(post: BlogPost) {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    startTransition(async () => {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? { ...p, status: updated.status, published_at: updated.published_at }
              : p
          )
        );
        showToast(
          newStatus === 'published'
            ? `"${post.title}" is now live.`
            : `"${post.title}" moved to draft.`
        );
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error ?? 'Failed to update post.', 'error');
      }
    });
  }

  // Bulk action
  async function bulkAction(action: 'publish' | 'unpublish' | 'archive') {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    startTransition(async () => {
      const res = await fetch('/api/admin/blog/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      });
      if (res.ok) {
        const { posts: updatedPosts } = await res.json() as { updated: number; posts: Array<{ id: string; status: string; published_at: string | null }> };
        const updateMap = new Map(updatedPosts.map((u) => [u.id, u]));
        setPosts((prev) =>
          prev.map((p) => {
            const u = updateMap.get(p.id);
            return u ? { ...p, status: u.status, published_at: u.published_at } : p;
          })
        );
        setSelected(new Set());
        const label =
          action === 'publish' ? 'published' : action === 'unpublish' ? 'moved to draft' : 'archived';
        showToast(`${ids.length} post${ids.length !== 1 ? 's' : ''} ${label}.`);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error ?? 'Bulk action failed.', 'error');
      }
    });
  }

  // Stats
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const featuredCount = posts.filter((p) => p.featured).length;

  function SortIndicator({ k }: { k: SortKey }) {
    if (sortKey !== k) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3 w-3 ml-1 inline" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1 inline" />
    );
  }

  function handleSaved(saved: BlogPost) {
    setPosts((prev) => {
      const exists = prev.find((p) => p.id === saved.id);
      if (exists) {
        return prev.map((p) => (p.id === saved.id ? saved : p));
      }
      return [saved, ...prev];
    });
    showToast(
      editorState === 'new'
        ? `"${saved.title}" created.`
        : `"${saved.title}" updated.`
    );
  }

  return (
    <div className="space-y-6">
      {/* Editor modal */}
      {editorState !== null && (
        <PostEditor
          post={editorState === 'new' ? null : editorState}
          categories={categories}
          onClose={() => setEditorState(null)}
          onSaved={handleSaved}
        />
      )}

      <PageHeader
        title="Blog Management"
        description={`${posts.length} posts total · ${publishedCount} published · ${draftCount} drafts`}
        actions={
          <Button onClick={() => setEditorState('new')} className="gap-2">
            <PenSquare className="h-4 w-4" />
            New Post
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Globe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{draftCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Star className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">{featuredCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter / search bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search title or slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm w-56 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground ml-auto">{visible.length} shown</span>
          </div>
        </CardContent>
      </Card>

      {/* Bulk action toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-3">
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {selected.size} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="default"
              onClick={() => bulkAction('publish')}
              disabled={isPending}
              className="gap-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              Publish all
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkAction('unpublish')}
              disabled={isPending}
              className="gap-1"
            >
              <EyeOff className="h-3.5 w-3.5" />
              Unpublish all
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkAction('archive')}
              disabled={isPending}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <Archive className="h-3.5 w-3.5" />
              Archive all
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelected(new Set())}
              disabled={isPending}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Posts table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={allVisibleSelected ? 'Deselect all' : 'Select all'}
                    >
                      {allVisibleSelected ? (
                        <CheckSquare className="h-4 w-4 text-indigo-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort('title')}
                  >
                    Title <SortIndicator k="title" />
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th
                    className="px-4 py-3 text-left font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort('status')}
                  >
                    Status <SortIndicator k="status" />
                  </th>
                  <th
                    className="px-4 py-3 text-right font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort('view_count')}
                  >
                    Views <SortIndicator k="view_count" />
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort('created_at')}
                  >
                    Created <SortIndicator k="created_at" />
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      No posts match the current filters.
                    </td>
                  </tr>
                )}
                {visible.map((post) => (
                  <tr
                    key={post.id}
                    className={`hover:bg-muted/30 transition-colors ${selected.has(post.id) ? 'bg-indigo-50/60 dark:bg-indigo-950/20' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected.has(post.id)}
                        onCheckedChange={() => toggleOne(post.id)}
                        aria-label={`Select "${post.title}"`}
                      />
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{post.title}</p>
                          <p className="text-xs text-muted-foreground truncate">/blog/{post.slug}</p>
                        </div>
                        {post.featured && (
                          <Star className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {post.category_name ? (
                        <Badge variant="outline" className="text-xs">{post.category_name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.status} publishedAt={post.published_at} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {post.view_count != null ? (
                        <span className="flex items-center justify-end gap-1">
                          <Eye className="h-3 w-3" />
                          {post.view_count.toLocaleString()}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'published' && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            title="View live"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditorState(post)}
                          disabled={isPending}
                          className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                          title="Edit post"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant={post.status === 'published' ? 'outline' : 'default'}
                          onClick={() => togglePost(post)}
                          disabled={isPending}
                          className={
                            post.status === 'published'
                              ? 'h-7 px-2.5 text-xs gap-1'
                              : 'h-7 px-2.5 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white'
                          }
                        >
                          {post.status === 'published' ? (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Send className="h-3 w-3" />
                              Publish
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${
            toast.type === 'error' ? 'bg-destructive' : 'bg-green-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, publishedAt }: { status: string; publishedAt: string | null }) {
  if (status === 'published') {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800 text-xs gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
        Live
        {publishedAt && (
          <span className="text-green-600 dark:text-green-400 font-normal ml-1">
            {new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </Badge>
    );
  }
  if (status === 'archived') {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        Archived
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800">
      Draft
    </Badge>
  );
}
