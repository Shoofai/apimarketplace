'use client';

import { useState, useTransition } from 'react';
import {
  Plus, Pencil, Trash2, ChevronUp, ChevronDown,
  Eye, EyeOff, HelpCircle, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Category = 'general' | 'pricing' | 'enterprise';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: Category;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type FormState = {
  question: string;
  answer: string;
  category: Category;
  sort_order: number;
  is_active: boolean;
};

const CATEGORY_LABELS: Record<Category, string> = {
  general: 'General',
  pricing: 'Pricing',
  enterprise: 'Enterprise',
};

const CATEGORY_COLORS: Record<Category, string> = {
  general: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  pricing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

const EMPTY_FORM: FormState = {
  question: '',
  answer: '',
  category: 'general',
  sort_order: 0,
  is_active: true,
};

interface Props {
  initialFaqs: FAQ[];
}

export function FAQsAdminClient({ initialFaqs }: Props) {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  // ── helpers ──────────────────────────────────────────────
  const openCreate = () => {
    const visible = filtered;
    const maxOrder = visible.length ? Math.max(...visible.map(f => f.sort_order)) : 0;
    setEditingFaq(null);
    setForm({ ...EMPTY_FORM, category: filterCategory === 'all' ? 'general' : filterCategory, sort_order: maxOrder + 1 });
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category, sort_order: faq.sort_order, is_active: faq.is_active });
    setError('');
    setDialogOpen(true);
  };

  const filtered = faqs.filter(f => filterCategory === 'all' || f.category === filterCategory);

  // Group for display when showing all
  const grouped: Record<Category, FAQ[]> = { general: [], pricing: [], enterprise: [] };
  for (const f of faqs) grouped[f.category].push(f);

  // ── API calls ─────────────────────────────────────────────
  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) {
      setError('Question and answer are required.');
      return;
    }
    setError('');
    startTransition(async () => {
      const url = editingFaq
        ? `/api/admin/faqs/${editingFaq.id}`
        : '/api/admin/faqs';
      const method = editingFaq ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? 'Failed to save.');
        return;
      }
      const saved: FAQ = await res.json();
      setFaqs(prev =>
        editingFaq
          ? prev.map(f => (f.id === saved.id ? saved : f))
          : [...prev, saved]
      );
      setDialogOpen(false);
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
      if (res.ok) setFaqs(prev => prev.filter(f => f.id !== id));
    });
  }

  async function toggleActive(faq: FAQ) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !faq.is_active }),
      });
      if (res.ok) {
        const updated: FAQ = await res.json();
        setFaqs(prev => prev.map(f => (f.id === updated.id ? updated : f)));
      }
    });
  }

  async function moveOrder(faq: FAQ, direction: 'up' | 'down') {
    const siblings = faqs
      .filter(f => f.category === faq.category)
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = siblings.findIndex(f => f.id === faq.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const sibling = siblings[swapIdx];

    // optimistic update
    const newOrderA = sibling.sort_order;
    const newOrderB = faq.sort_order;
    setFaqs(prev =>
      prev.map(f => {
        if (f.id === faq.id) return { ...f, sort_order: newOrderA };
        if (f.id === sibling.id) return { ...f, sort_order: newOrderB };
        return f;
      })
    );

    startTransition(async () => {
      await Promise.all([
        fetch(`/api/admin/faqs/${faq.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: newOrderA }),
        }),
        fetch(`/api/admin/faqs/${sibling.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: newOrderB }),
        }),
      ]);
    });
  }

  // ── render ────────────────────────────────────────────────
  const categoriesToShow: Category[] =
    filterCategory === 'all' ? ['general', 'pricing', 'enterprise'] : [filterCategory];

  const totalActive = faqs.filter(f => f.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            FAQ Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {faqs.length} total · {totalActive} active
          </p>
        </div>
        <Button onClick={openCreate} disabled={isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'general', 'pricing', 'enterprise'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filterCategory === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
            }`}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
            <span className="ml-1.5 text-xs opacity-70">
              {cat === 'all' ? faqs.length : faqs.filter(f => f.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* FAQ groups */}
      {categoriesToShow.map(cat => {
        const items = faqs
          .filter(f => f.category === cat)
          .sort((a, b) => a.sort_order - b.sort_order);
        if (items.length === 0 && filterCategory !== cat) return null;

        return (
          <Card key={cat}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[cat]}`}>
                  {CATEGORY_LABELS[cat]}
                </span>
                <span className="text-muted-foreground font-normal text-sm">{items.length} items</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">No FAQs in this category yet.</p>
              )}
              {items.map((faq, idx) => (
                <div
                  key={faq.id}
                  className={`flex gap-3 items-start p-3 rounded-lg border transition-colors ${
                    faq.is_active
                      ? 'border-border bg-card'
                      : 'border-dashed border-border/50 bg-muted/30 opacity-60'
                  }`}
                >
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 pt-0.5 shrink-0">
                    <button
                      onClick={() => moveOrder(faq, 'up')}
                      disabled={idx === 0 || isPending}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveOrder(faq, 'down')}
                      disabled={idx === items.length - 1 || isPending}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug">{faq.question}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleActive(faq)}
                      disabled={isPending}
                      title={faq.is_active ? 'Hide' : 'Show'}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {faq.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(faq)}
                      title="Edit"
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(faq)}
                      title="Delete"
                      className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={form.category}
                onValueChange={v => setForm(f => ({ ...f, category: v as Category }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Question</label>
              <Input
                value={form.question}
                onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                placeholder="What is your question?"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Answer</label>
              <Textarea
                value={form.answer}
                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                placeholder="Provide a clear, helpful answer..."
                rows={5}
              />
            </div>

            <div className="flex gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-sm font-medium">Sort order</label>
                <Input
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Visibility</label>
                <div className="flex items-center gap-2 h-10">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      form.is_active ? 'bg-primary' : 'bg-input'
                    }`}
                    role="switch"
                    aria-checked={form.is_active}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        form.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-muted-foreground">{form.is_active ? 'Active' : 'Hidden'}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? 'Saving…' : editingFaq ? 'Save changes' : 'Add FAQ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.question}&rdquo; will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
