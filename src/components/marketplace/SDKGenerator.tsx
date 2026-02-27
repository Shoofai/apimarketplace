'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code2, Download, Copy, Check, Loader2, Sparkles } from 'lucide-react';

type SDKLanguage = 'typescript' | 'python' | 'go';

const LANGUAGES: { value: SDKLanguage; label: string; badge: string }[] = [
  { value: 'typescript', label: 'TypeScript', badge: 'TS' },
  { value: 'python', label: 'Python', badge: 'PY' },
  { value: 'go', label: 'Go', badge: 'GO' },
];

interface Props {
  apiId: string;
  apiName: string;
  hasSpec: boolean;
}

export function SDKGenerator({ apiId, apiName, hasSpec }: Props) {
  const [language, setLanguage] = useState<SDKLanguage>('typescript');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('client.ts');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    setCode(null);
    try {
      const res = await fetch(`/api/apis/${apiId}/sdk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Generation failed');
      setCode(data.code);
      setFilename(data.filename ?? `client.${language === 'typescript' ? 'ts' : language === 'python' ? 'py' : 'go'}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!hasSpec) {
    return (
      <div className="bg-white dark:bg-card rounded-lg shadow-sm border p-8 text-center">
        <Code2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
        <p className="font-medium text-muted-foreground">No OpenAPI spec available</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          SDK generation requires an OpenAPI spec to be attached to this API.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card rounded-lg shadow-sm border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Generated SDK
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate a typed client for <span className="font-medium">{apiName}</span> powered by Claude.
          </p>
        </div>
        <Badge variant="outline" className="text-purple-600 border-purple-300 dark:border-purple-700">Beta</Badge>
      </div>

      <div className="flex items-center gap-3">
        <Select value={language} onValueChange={(v) => setLanguage(v as SDKLanguage)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{l.badge}</span>
                  {l.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Code2 className="h-4 w-4" />}
          {loading ? 'Generating…' : 'Generate SDK'}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {code && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">{filename}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload} className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>
          <pre className="text-xs font-mono bg-muted rounded-lg p-4 overflow-x-auto max-h-96 leading-relaxed whitespace-pre">
            {code}
          </pre>
        </div>
      )}
    </div>
  );
}
