'use client';

import { useEffect, useState, useTransition, use } from 'react';
import { ArrowLeft, ThumbsUp, MessageSquare, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Post {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
}

interface Topic {
  id: string;
  title: string;
  category: string | null;
  body: string | null;
  user_id: string;
  created_at: string;
  upvote_count: number;
  post_count: number;
}

export default function ForumTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userVoted, setUserVoted] = useState(false);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch(`/api/forum/topics/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setTopic(d.topic ?? null);
        setPosts(d.posts ?? []);
        setUserVoted(d.userVoted ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function toggleVote() {
    if (!topic) return;
    startTransition(async () => {
      const res = await fetch(`/api/forum/topics/${id}`, { method: 'POST' });
      if (res.ok) {
        const d = await res.json();
        setUserVoted(d.voted);
        setTopic((prev) => prev ? { ...prev, upvote_count: prev.upvote_count + (d.voted ? 1 : -1) } : prev);
      }
    });
  }

  async function submitReply() {
    if (!reply.trim()) return;
    startTransition(async () => {
      const res = await fetch(`/api/forum/topics/${id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: reply }),
      });
      if (res.ok) {
        const d = await res.json();
        setPosts((prev) => [...prev, d.post]);
        setReply('');
        setTopic((prev) => prev ? { ...prev, post_count: prev.post_count + 1 } : prev);
      }
    });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl text-center py-16">
        <p className="text-gray-500">Topic not found.</p>
        <Link href="/dashboard/forum" className="mt-4 inline-block text-primary-600 hover:underline">
          ← Back to forum
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/dashboard/forum" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <ArrowLeft className="h-4 w-4" /> Back to forum
      </Link>

      {/* Topic card */}
      <Card className="p-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{topic.title}</h1>
          {topic.category && <Badge variant="outline" className="shrink-0 dark:border-gray-600">{topic.category}</Badge>}
        </div>
        {topic.body && (
          <p className="mb-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{topic.body}</p>
        )}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" /> {topic.post_count} {topic.post_count === 1 ? 'reply' : 'replies'}
            </span>
            <span>{new Date(topic.created_at).toLocaleDateString()}</span>
          </div>
          <button
            onClick={toggleVote}
            disabled={isPending}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              userVoted
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            {topic.upvote_count} {userVoted ? 'Upvoted' : 'Upvote'}
          </button>
        </div>
      </Card>

      {/* Replies */}
      {posts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}
          </h2>
          {posts.map((post, i) => (
            <Card key={post.id} className="flex gap-3 p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{post.body}</p>
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reply form */}
      <Card className="p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">Post a reply</h2>
        <textarea
          placeholder="Write your reply… (supports plain text)"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-gray-700 dark:bg-gray-800"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={submitReply} disabled={isPending || !reply.trim()} className="gap-2">
            <Send className="h-4 w-4" />
            {isPending ? 'Posting…' : 'Post Reply'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
