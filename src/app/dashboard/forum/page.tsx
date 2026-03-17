'use client';

import { useEffect, useState, useTransition } from 'react';
import { MessageSquare, ThumbsUp, Plus, Search, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Topic {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  user_id: string;
  created_at: string;
  upvote_count: number;
  post_count: number;
}

const CATEGORIES = ['All', 'General', 'API Providers', 'Developers', 'Feature Requests', 'Bug Reports'];

export default function ForumPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCat, setNewCat] = useState('General');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch('/api/forum/topics')
      .then((r) => r.json())
      .then((d) => { setTopics(d.topics ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = topics.filter((t) => {
    const matchCat = category === 'All' || t.category === category;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  async function handleCreate() {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      const res = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, category: newCat, body: newBody }),
      });
      if (res.ok) {
        const d = await res.json();
        setTopics((prev) => [{ ...d.topic, upvote_count: 0, post_count: 0 }, ...prev]);
        setNewTitle(''); setNewBody(''); setShowNew(false);
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Forum</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ask questions, share ideas, and get help from the community</p>
        </div>
        <Button onClick={() => setShowNew((v) => !v)} className="gap-2">
          <Plus className="h-4 w-4" /> New Topic
        </Button>
      </div>

      {/* New topic form */}
      {showNew && (
        <Card className="p-5 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Create a new topic</h2>
            <button onClick={() => setShowNew(false)}><X className="h-4 w-4 text-gray-400" /></button>
          </div>
          <div className="space-y-3">
            <Input
              placeholder="Topic title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              maxLength={120}
            />
            <select
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring dark:border-gray-700 dark:bg-gray-800"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <textarea
              placeholder="Describe your question or idea (optional)"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-gray-700 dark:bg-gray-800"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isPending || !newTitle.trim()}>
                {isPending ? 'Posting…' : 'Post Topic'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search + category filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search topics…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                category === c
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Topic list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <MessageSquare className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="font-medium text-gray-500 dark:text-gray-400">No topics found</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Be the first to start a conversation</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((topic) => (
            <Link key={topic.id} href={`/dashboard/forum/${topic.id}`}>
              <Card className="group flex items-start gap-4 p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600">
                {/* Upvote count */}
                <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
                  <ThumbsUp className="h-4 w-4 text-gray-400 group-hover:text-primary-500" />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{topic.upvote_count}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400 line-clamp-2">
                      {topic.title}
                    </h3>
                    {topic.category && (
                      <Badge variant="outline" className="shrink-0 text-xs dark:border-gray-600">
                        {topic.category}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" /> {topic.post_count} {topic.post_count === 1 ? 'reply' : 'replies'}
                    </span>
                    <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
