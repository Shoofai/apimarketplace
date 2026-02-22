'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/modal';
import { AlertCircle, Loader2 } from 'lucide-react';

type Gap = { id: string; severity: string; category: string; message: string; fix: string };

export function AuditTool() {
  const router = useRouter();
  const [mode, setMode] = useState<'url' | 'paste'>('url');
  const [specUrl, setSpecUrl] = useState('');
  const [specPaste, setSpecPaste] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; gaps: Gap[]; topGaps: Gap[] } | null>(null);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const runAudit = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      let body: { specUrl?: string; spec?: object };
      if (mode === 'url') {
        body = { specUrl: specUrl.trim() };
      } else {
        try {
          body = { spec: JSON.parse(specPaste.trim()) as object };
        } catch {
          setError('Invalid JSON. Paste a valid OpenAPI spec (JSON).');
          return;
        }
      }
      const res = await fetch('/api/readiness/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Audit failed');
        return;
      }
      setResult({ score: data.score, gaps: data.gaps ?? [], topGaps: data.topGaps ?? [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const submitLead = async () => {
    if (!leadEmail.trim() || !leadEmail.includes('@')) {
      setLeadError('Please enter a valid email.');
      return;
    }
    setLeadError(null);
    setLeadSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadEmail.trim(),
          full_name: leadName.trim() || null,
          company_size: leadCompany.trim() || null,
          primary_goal: 'Production Readiness audit',
          source: 'readiness_audit',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLeadError(data.error || 'Failed to submit');
        return;
      }
      setLeadModalOpen(false);
      router.push('/signup');
    } catch {
      setLeadError('Failed to submit. Please try again.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Run a free quick audit</CardTitle>
          <CardDescription>
            Enter your OpenAPI spec URL or paste the spec (JSON). We&apos;ll run a quick check and show your score and top gaps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 border-b border-border pb-2">
            <Button
              type="button"
              variant={mode === 'url' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('url')}
            >
              Spec URL
            </Button>
            <Button
              type="button"
              variant={mode === 'paste' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('paste')}
            >
              Paste JSON
            </Button>
          </div>
          {mode === 'url' ? (
            <div className="space-y-2">
              <Label htmlFor="spec-url">OpenAPI spec URL</Label>
              <Input
                id="spec-url"
                type="url"
                placeholder="https://api.example.com/openapi.json"
                value={specUrl}
                onChange={(e) => setSpecUrl(e.target.value)}
                disabled={loading}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="spec-paste">OpenAPI spec (JSON)</Label>
              <textarea
                id="spec-paste"
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder='{"openapi":"3.0.0","info":{...},"paths":{...}}'
                value={specPaste}
                onChange={(e) => setSpecPaste(e.target.value)}
                disabled={loading}
              />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <Button onClick={runAudit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running audit…
              </>
            ) : (
              'Run free audit'
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Quick audit result</CardTitle>
            <CardDescription>
              Score: <strong>{result.score}/100</strong>
              {result.gaps.length > 0 && ` · ${result.gaps.length} gap(s) found`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.topGaps.length > 0 ? (
              <ul className="space-y-2">
                {result.topGaps.map((g) => (
                  <li
                    key={g.id}
                    className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <span className="font-medium capitalize text-foreground">{g.severity}</span>
                    <span className="text-muted-foreground"> · {g.message}</span>
                    <p className="mt-1 text-muted-foreground">{g.fix}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No issues found in the quick check.</p>
            )}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">
                Get a full Production Readiness audit with all gaps and a detailed report.
              </p>
              <Button onClick={() => setLeadModalOpen(true)}>Get full audit</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal open={leadModalOpen} onOpenChange={setLeadModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Get your full audit</ModalTitle>
            <ModalDescription>
              We&apos;ll run a full Production Readiness audit and send you the report. Enter your email to get started.
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="lead-email">Email *</Label>
              <Input
                id="lead-email"
                type="email"
                placeholder="you@company.com"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                disabled={leadSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-name">Name (optional)</Label>
              <Input
                id="lead-name"
                type="text"
                placeholder="Your name"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                disabled={leadSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-company">Company (optional)</Label>
              <Input
                id="lead-company"
                type="text"
                placeholder="Company name"
                value={leadCompany}
                onChange={(e) => setLeadCompany(e.target.value)}
                disabled={leadSubmitting}
              />
            </div>
            {leadError && (
              <p className="text-sm text-destructive">{leadError}</p>
            )}
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setLeadModalOpen(false)} disabled={leadSubmitting}>
              Cancel
            </Button>
            <Button onClick={submitLead} disabled={leadSubmitting}>
              {leadSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                'Continue to sign up'
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
