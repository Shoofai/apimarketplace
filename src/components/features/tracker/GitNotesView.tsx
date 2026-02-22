'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { MessageSquare, PlusCircle } from 'lucide-react';

type Entry = {
  sha: string;
  date: string;
  subject: string;
  note: string;
};

type RecentCommit = { sha: string; subject: string };

export function GitNotesView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [recentCommits, setRecentCommits] = useState<RecentCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSha, setSelectedSha] = useState<string>('');
  const [customSha, setCustomSha] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refetch = () => {
    fetch('/api/admin/tracker/changelog-notes')
      .then((res) => res.json())
      .then((data) => setEntries(data.entries ?? []))
      .catch(console.error);
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/tracker/changelog-notes').then((r) => r.json()),
      fetch('/api/admin/tracker/recent-commits').then((r) => r.json()),
    ])
      .then(([notesData, commitsData]) => {
        setEntries(notesData.entries ?? []);
        setRecentCommits(commitsData.commits ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const sha = customSha.trim() || selectedSha;
    if (!sha) {
      setFormError('Select a commit or enter a SHA.');
      return;
    }
    if (!message.trim()) {
      setFormError('Enter a note message.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/tracker/changelog-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sha, message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? 'Failed to add note');
        return;
      }
      setMessage('');
      setCustomSha('');
      setSelectedSha('');
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Add or update note for a commit
          </h2>
          <p className="text-sm text-muted-foreground">
            Attach a changelog note to any commit (refs/notes/implemented). Use this after each commit to keep the changelog in sync. To be prompted on every commit, install <code className="text-xs bg-muted px-1 rounded">scripts/post-commit-add-note.sh</code> as <code className="text-xs bg-muted px-1 rounded">.git/hooks/post-commit</code>.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="git-notes-commit">Commit</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedSha} onValueChange={(v) => { setSelectedSha(v); setCustomSha(''); }}>
                  <SelectTrigger id="git-notes-commit" className="sm:max-w-xs">
                    <SelectValue placeholder="Select recent commit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recentCommits.map((c) => (
                      <SelectItem key={c.sha} value={c.sha}>
                        <span className="font-mono text-muted-foreground">{c.sha}</span>
                        <span className="ml-2 truncate">{c.subject}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground self-center">or</span>
                <Input
                  placeholder="Paste SHA (7–40 hex)"
                  value={customSha}
                  onChange={(e) => { setCustomSha(e.target.value); if (e.target.value) setSelectedSha(''); }}
                  className="font-mono sm:max-w-[12rem]"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="git-notes-message">Note message</Label>
              <Textarea
                id="git-notes-message"
                placeholder="e.g. 2026-02-21: Feature name. Plan: plan_id."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="resize-y"
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add / update note'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No git notes found yet. Add one above or with:{' '}
          <code className="bg-muted px-1 rounded text-xs">git notes --ref=implemented add -m &quot;…&quot; &lt;sha&gt;</code>
        </p>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            {entries.length} commit{entries.length !== 1 ? 's' : ''} with implementation notes (newest first).
          </p>
      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry.sha}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <span className="font-mono text-sm text-muted-foreground" title={entry.sha}>
                  {entry.sha}
                </span>
                <time dateTime={entry.date} className="text-sm text-muted-foreground">
                  {format(new Date(entry.date), 'PPP')}
                </time>
              </div>
              <p className="font-medium">{entry.subject}</p>
            </CardHeader>
            {entry.note && (
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.note}</div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
        </>
      )}
    </div>
  );
}
