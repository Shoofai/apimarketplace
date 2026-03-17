'use client';

import { useEffect, useState, useTransition } from 'react';
import { Plus, Trophy, Calendar, ChevronDown, X, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

function statusOf(c: Challenge) {
  const now = Date.now();
  if (c.ends_at && Date.parse(c.ends_at) < now) return 'ended';
  if (c.starts_at && Date.parse(c.starts_at) > now) return 'upcoming';
  return 'active';
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  ended: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
  upcoming: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Challenge | null>(null);
  const [form, setForm] = useState({ title: '', description: '', starts_at: '', ends_at: '' });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/challenges')
      .then((r) => r.json())
      .then((d) => { setChallenges(d.challenges ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ title: '', description: '', starts_at: '', ends_at: '' });
    setShowForm(true);
    setError('');
  }

  function openEdit(c: Challenge) {
    setEditing(c);
    setForm({
      title: c.title,
      description: c.description ?? '',
      starts_at: c.starts_at ? c.starts_at.slice(0, 16) : '',
      ends_at: c.ends_at ? c.ends_at.slice(0, 16) : '',
    });
    setShowForm(true);
    setError('');
  }

  async function handleSubmit() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    startTransition(async () => {
      const payload = editing
        ? { id: editing.id, ...form }
        : form;
      const url = '/api/admin/challenges';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? 'Error'); return; }
      if (editing) {
        setChallenges((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...d.challenge } : c));
      } else {
        setChallenges((prev) => [d.challenge, ...prev]);
      }
      setShowForm(false);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" /> Developer Challenges
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and manage challenges to engage your developer community
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> New Challenge
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-5 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {editing ? 'Edit Challenge' : 'Create New Challenge'}
            </h2>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Title *</label>
              <Input
                placeholder="e.g. Build the best weather integration"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Description</label>
              <textarea
                placeholder="Describe the challenge, rules, and prizes…"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  <Calendar className="inline h-3.5 w-3.5 mr-1" />Starts at
                </label>
                <Input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  <Calendar className="inline h-3.5 w-3.5 mr-1" />Ends at
                </label>
                <Input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create Challenge'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Challenge list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : challenges.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <Trophy className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="font-medium text-gray-500 dark:text-gray-400">No challenges yet</p>
          <p className="mt-1 text-sm text-gray-400">Create your first challenge to engage developers</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {challenges.map((c) => {
            const status = statusOf(c);
            return (
              <Card key={c.id} className="flex items-start gap-4 p-4 dark:border-gray-700 dark:bg-gray-900">
                <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{c.title}</h3>
                    <Badge className={`shrink-0 text-xs border ${STATUS_COLORS[status]}`}>
                      {status}
                    </Badge>
                  </div>
                  {c.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{c.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500">
                    {c.starts_at && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Starts {new Date(c.starts_at).toLocaleDateString()}</span>}
                    {c.ends_at && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Ends {new Date(c.ends_at).toLocaleDateString()}</span>}
                    <span>Created {new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => openEdit(c)}
                  className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
