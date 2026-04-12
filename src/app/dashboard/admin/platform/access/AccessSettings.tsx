'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Globe, Lock, Wrench, Plus, Trash2, Copy, Check, RefreshCw,
  KeyRound, Mail, Users, ShieldCheck, AlertTriangle,
} from 'lucide-react';
import type { SiteMode } from '@/lib/settings/site-mode';

type AllowlistEntry = { id: string; email: string; note: string | null; added_at: string };
type InviteCode = {
  id: string; code: string; label: string | null;
  max_uses: number; uses_count: number;
  expires_at: string | null; is_active: boolean; created_at: string;
};
type WaitlistEntry = { id: string; email: string; full_name: string | null; role: string | null; created_at: string };

interface Props {
  initialMode: SiteMode;
  initialMessage: string;
  initialAllowlist: AllowlistEntry[];
  initialCodes: InviteCode[];
  waitlist: WaitlistEntry[];
}

// ── Mode selector ────────────────────────────────────────────────────────────

const MODES: { value: SiteMode; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    value: 'live',
    label: 'Live',
    desc: 'Site is fully public. All visitors can access every page.',
    icon: <Globe className="h-5 w-5" />,
    color: 'border-green-500 bg-green-50 dark:bg-green-900/10',
  },
  {
    value: 'prelaunch',
    label: 'Prelaunch',
    desc: 'Public sees a waitlist page. Signed-in users and invite-code holders get full access.',
    icon: <Lock className="h-5 w-5" />,
    color: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10',
  },
  {
    value: 'maintenance',
    label: 'Maintenance',
    desc: 'Everyone sees a "back soon" page. Only platform admins bypass it.',
    icon: <Wrench className="h-5 w-5" />,
    color: 'border-amber-500 bg-amber-50 dark:bg-amber-900/10',
  },
];

function ModeCard({ mode, selected, onSelect }: { mode: typeof MODES[0]; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${selected ? mode.color + ' shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={selected ? 'text-current' : 'text-muted-foreground'}>{mode.icon}</span>
        <span className="font-semibold text-sm">{mode.label}</span>
        {selected && <Check className="h-4 w-4 ml-auto text-current" />}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{mode.desc}</p>
    </button>
  );
}

// ── Invite codes ─────────────────────────────────────────────────────────────

function InviteCodeRow({ code, siteUrl, onRevoke, onDelete }: {
  code: InviteCode;
  siteUrl: string;
  onRevoke: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const link = `${siteUrl}/early-access?code=${code.code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExhausted = code.uses_count >= code.max_uses;
  const isExpired = code.expires_at ? new Date(code.expires_at) < new Date() : false;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0 border-gray-100 dark:border-gray-800">
      <code className="font-mono text-sm font-bold tracking-widest text-gray-900 dark:text-white w-24 shrink-0">
        {code.code}
      </code>
      <div className="flex-1 min-w-0">
        {code.label && <p className="text-xs text-muted-foreground truncate">{code.label}</p>}
        <p className="text-xs text-muted-foreground">
          {code.uses_count}/{code.max_uses} uses
          {code.expires_at && ` · expires ${new Date(code.expires_at).toLocaleDateString()}`}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {!code.is_active && <Badge variant="outline" className="text-xs text-gray-400">Revoked</Badge>}
        {isExhausted && code.is_active && <Badge variant="outline" className="text-xs text-amber-600">Exhausted</Badge>}
        {isExpired && code.is_active && <Badge variant="outline" className="text-xs text-red-600">Expired</Badge>}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyLink} title="Copy invite link">
          {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost" size="icon" className="h-7 w-7"
          onClick={() => onRevoke(code.id, !code.is_active)}
          title={code.is_active ? 'Revoke' : 'Re-activate'}
        >
          <ShieldCheck className={`h-3.5 w-3.5 ${code.is_active ? 'text-muted-foreground' : 'text-green-600'}`} />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => onDelete(code.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AccessSettings({ initialMode, initialMessage, initialAllowlist, initialCodes, waitlist }: Props) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Mode form
  const [mode, setMode] = useState<SiteMode>(initialMode);
  const [message, setMessage] = useState(initialMessage);
  const [modeSaving, setModeSaving] = useState(false);
  const [modeSaved, setModeSaved] = useState(false);

  // Allowlist
  const [allowlist, setAllowlist] = useState<AllowlistEntry[]>(initialAllowlist);
  const [newEmail, setNewEmail] = useState('');
  const [newNote, setNewNote] = useState('');
  const [emailAdding, setEmailAdding] = useState(false);

  // Invite codes
  const [codes, setCodes] = useState<InviteCode[]>(initialCodes);
  const [codeLabel, setCodeLabel] = useState('');
  const [codeMaxUses, setCodeMaxUses] = useState('1');
  const [codeExpiry, setCodeExpiry] = useState('');
  const [codeGenerating, setCodeGenerating] = useState(false);

  // ── Mode save
  const saveMode = async () => {
    setModeSaving(true);
    await fetch('/api/admin/settings/site-mode', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, message: message || null }),
    });
    setModeSaving(false);
    setModeSaved(true);
    setTimeout(() => setModeSaved(false), 2500);
  };

  // ── Allowlist
  const addEmail = async () => {
    if (!newEmail.trim()) return;
    setEmailAdding(true);
    const res = await fetch('/api/admin/access/allowlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail.trim(), note: newNote.trim() || undefined }),
    });
    if (res.ok) {
      const entry = await res.json();
      setAllowlist((prev) => [entry, ...prev]);
      setNewEmail('');
      setNewNote('');
    }
    setEmailAdding(false);
  };

  const removeEmail = async (id: string) => {
    await fetch(`/api/admin/access/allowlist/${id}`, { method: 'DELETE' });
    setAllowlist((prev) => prev.filter((e) => e.id !== id));
  };

  // ── Invite codes
  const generateCode = async () => {
    setCodeGenerating(true);
    const res = await fetch('/api/admin/access/invite-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: codeLabel || undefined,
        max_uses: parseInt(codeMaxUses) || 1,
        expires_at: codeExpiry || undefined,
      }),
    });
    if (res.ok) {
      const code = await res.json();
      setCodes((prev) => [code, ...prev]);
      setCodeLabel('');
      setCodeMaxUses('1');
      setCodeExpiry('');
    }
    setCodeGenerating(false);
  };

  const revokeCode = async (id: string, active: boolean) => {
    const res = await fetch(`/api/admin/access/invite-codes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: active }),
    });
    if (res.ok) setCodes((prev) => prev.map((c) => c.id === id ? { ...c, is_active: active } : c));
  };

  const deleteCode = async (id: string) => {
    await fetch(`/api/admin/access/invite-codes/${id}`, { method: 'DELETE' });
    setCodes((prev) => prev.filter((c) => c.id !== id));
  };

  // ── CSV export for waitlist
  const exportWaitlist = () => {
    const header = 'Email,Name,Role,Signed Up';
    const rows = waitlist.map((w) =>
      [w.email, w.full_name ?? '', w.role ?? '', new Date(w.created_at!).toLocaleDateString()].map((v) => `"${v}"`).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'waitlist.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" />
          Access Control
        </h1>
        <p className="text-muted-foreground">Control who can access the platform and manage early access.</p>
      </div>

      {/* ── Site Mode ── */}
      <Card>
        <CardHeader>
          <CardTitle>Site mode</CardTitle>
          <CardDescription>
            Controls what visitors see. Changes take effect within ~10 seconds (middleware cache).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'maintenance' && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Maintenance mode blocks all non-admin users — including paying customers.
            </div>
          )}
          <div className="flex gap-3">
            {MODES.map((m) => (
              <ModeCard key={m.value} mode={m} selected={mode === m.value} onSelect={() => setMode(m.value)} />
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gate-message">Custom message <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              id="gate-message"
              placeholder="Leave blank to use the default message shown on the gate page."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />
          </div>
          <Button onClick={saveMode} disabled={modeSaving} className="gap-2">
            {modeSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : modeSaved ? <Check className="h-4 w-4" /> : null}
            {modeSaved ? 'Saved!' : 'Save mode'}
          </Button>
        </CardContent>
      </Card>

      {/* ── Email Allowlist ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email allowlist
          </CardTitle>
          <CardDescription>
            Signed-in users whose emails are on this list bypass the prelaunch gate automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="user@company.com"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEmail()}
              className="flex-1"
            />
            <Input
              placeholder="Note (optional)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-40"
            />
            <Button onClick={addEmail} disabled={emailAdding || !newEmail.trim()} className="gap-1.5 shrink-0">
              {emailAdding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
            {allowlist.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No emails yet. Add some above.</p>
            ) : allowlist.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-3 py-2.5">
                <span className="flex-1 text-sm font-medium">{entry.email}</span>
                {entry.note && <span className="text-xs text-muted-foreground">{entry.note}</span>}
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(entry.added_at).toLocaleDateString()}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => removeEmail(entry.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{allowlist.length} email{allowlist.length !== 1 ? 's' : ''} on allowlist</p>
        </CardContent>
      </Card>

      {/* ── Invite Codes ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Invite codes
          </CardTitle>
          <CardDescription>
            Generate shareable codes. Anyone with a valid code bypasses the prelaunch gate (no sign-in required).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Generate new code</p>
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Label (e.g. Partner A)"
                value={codeLabel}
                onChange={(e) => setCodeLabel(e.target.value)}
                className="flex-1 min-w-32"
              />
              <Input
                type="number"
                placeholder="Max uses"
                min={1}
                value={codeMaxUses}
                onChange={(e) => setCodeMaxUses(e.target.value)}
                className="w-24"
              />
              <Input
                type="date"
                placeholder="Expires"
                value={codeExpiry}
                onChange={(e) => setCodeExpiry(e.target.value)}
                className="w-36"
              />
              <Button onClick={generateCode} disabled={codeGenerating} className="gap-1.5">
                {codeGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Generate
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 px-3">
            {codes.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No codes yet.</p>
            ) : codes.map((code) => (
              <InviteCodeRow
                key={code.id}
                code={code}
                siteUrl={siteUrl}
                onRevoke={revokeCode}
                onDelete={deleteCode}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{codes.length} code{codes.length !== 1 ? 's' : ''} · {codes.reduce((s, c) => s + c.uses_count, 0)} total redeemed</p>
        </CardContent>
      </Card>

      {/* ── Waitlist ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Waitlist
              </CardTitle>
              <CardDescription>{waitlist.length} signup{waitlist.length !== 1 ? 's' : ''}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportWaitlist} className="gap-1.5">
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Role</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {waitlist.length === 0 ? (
                  <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">No waitlist signups yet.</td></tr>
                ) : waitlist.slice(0, 50).map((w) => (
                  <tr key={w.id}>
                    <td className="px-3 py-2 font-medium">{w.email}</td>
                    <td className="px-3 py-2 text-muted-foreground">{w.full_name ?? '—'}</td>
                    <td className="px-3 py-2 text-muted-foreground">{w.role ?? '—'}</td>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(w.created_at!).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {waitlist.length > 50 && (
              <p className="px-3 py-2 text-xs text-muted-foreground border-t border-gray-100 dark:border-gray-800">
                Showing 50 of {waitlist.length} — export CSV to see all.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
