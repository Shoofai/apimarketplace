'use client';

import { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Loader2, Play, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { CodeGenEndpoint } from './InstantCodeGenerator';

interface APITestSandboxProps {
  apiName: string;
  apiBaseUrl?: string;
  endpoints: CodeGenEndpoint[];
  apiId?: string;
  className?: string;
}

interface TestResult {
  status: number;
  time_ms: number;
  passed: boolean;
  headers: Record<string, string>;
  body: unknown;
  error: string | null;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export function APITestSandbox({ apiName, apiBaseUrl, endpoints, apiId, className }: APITestSandboxProps) {
  const instanceId = useId();
  const [selectedEndpointIdx, setSelectedEndpointIdx] = useState(0);
  const [method, setMethod] = useState<string>(endpoints[0]?.method?.toUpperCase() ?? 'GET');
  const [path, setPath] = useState<string>(endpoints[0]?.path ?? '/');
  const [headersRaw, setHeadersRaw] = useState('{\n  "Authorization": "Bearer YOUR_API_KEY"\n}');
  const [bodyRaw, setBodyRaw] = useState('');
  const [paramsRaw, setParamsRaw] = useState('{}');
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'headers' | 'body' | 'params'>('headers');

  const anonSessionId =
    typeof window !== 'undefined'
      ? (sessionStorage.getItem('codegen_session') ??
        (() => {
          const id = crypto.randomUUID();
          try { sessionStorage.setItem('codegen_session', id); } catch {}
          return id;
        })())
      : undefined;

  const handleEndpointChange = (idx: number) => {
    const ep = endpoints[idx];
    if (!ep) return;
    setSelectedEndpointIdx(idx);
    setMethod(ep.method.toUpperCase());
    setPath(ep.path);
    setResult(null);
  };

  const parseJsonSafe = (raw: string): Record<string, unknown> | null => {
    try { return JSON.parse(raw || '{}'); } catch { return null; }
  };

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    try {
      const headers = parseJsonSafe(headersRaw) as Record<string, string> | null;
      const body = bodyRaw.trim() ? parseJsonSafe(bodyRaw) : null;
      const params = parseJsonSafe(paramsRaw) as Record<string, string> | null;

      const res = await fetch('/api/developer/test-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_name: apiName,
          api_id: apiId ?? null,
          endpoint_path: path,
          http_method: method,
          base_url: apiBaseUrl ?? null,
          request_headers: headers ?? {},
          request_body: body,
          request_params: params ?? {},
          session_id: anonSessionId ?? null,
        }),
      });
      const data = await res.json();
      setResult(data as TestResult);
    } catch {
      setResult({ status: 0, time_ms: 0, passed: false, headers: {}, body: null, error: 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (tab: typeof activeTab) =>
    cn(
      'px-3 py-1.5 text-sm font-medium rounded-md transition',
      activeTab === tab
        ? 'bg-white/10 text-white'
        : 'text-white/50 hover:text-white/80'
    );

  const selectId = `${instanceId}-ep`;

  return (
    <div className={cn('rounded-2xl border border-white/10 bg-gray-900 overflow-hidden', className)}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Play className="h-4 w-4 text-green-400" />
            API Sandbox
          </h3>
          <p className="text-white/50 text-xs mt-0.5">Test endpoints live in the browser</p>
        </div>
        {result && (
          <div className="flex items-center gap-2 text-sm">
            {result.passed ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
              {result.status > 0 ? result.status : 'Error'}
            </span>
            <Clock className="h-3 w-3 text-white/30" />
            <span className="text-white/50">{result.time_ms}ms</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Endpoint selector */}
        <div>
          <Label htmlFor={selectId} className="text-white/60 text-xs">Endpoint</Label>
          <select
            id={selectId}
            value={selectedEndpointIdx}
            onChange={(e) => handleEndpointChange(Number(e.target.value))}
            className="mt-1 w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-blue-500"
          >
            {endpoints.map((ep, i) => (
              <option key={i} value={i}>
                {ep.method.toUpperCase()} {ep.path}
              </option>
            ))}
          </select>
        </div>

        {/* Method + path */}
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-blue-500 w-28"
          >
            {HTTP_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono outline-none focus:border-blue-500"
            placeholder="/endpoint"
          />
        </div>

        {/* Tab: headers / body / params */}
        <div className="flex gap-1">
          {(['headers', 'body', 'params'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setActiveTab(t)} className={tabClass(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'headers' && (
          <textarea
            value={headersRaw}
            onChange={(e) => setHeadersRaw(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-green-400 text-sm font-mono outline-none focus:border-blue-500 resize-none"
            placeholder={'{\n  "Authorization": "Bearer YOUR_API_KEY"\n}'}
            spellCheck={false}
          />
        )}
        {activeTab === 'body' && (
          <textarea
            value={bodyRaw}
            onChange={(e) => setBodyRaw(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-green-400 text-sm font-mono outline-none focus:border-blue-500 resize-none"
            placeholder={'{\n  "key": "value"\n}'}
            spellCheck={false}
          />
        )}
        {activeTab === 'params' && (
          <textarea
            value={paramsRaw}
            onChange={(e) => setParamsRaw(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-green-400 text-sm font-mono outline-none focus:border-blue-500 resize-none"
            placeholder={'{\n  "limit": "10"\n}'}
            spellCheck={false}
          />
        )}

        {/* Run button */}
        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="w-full py-3 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {loading ? 'Running...' : 'Run Request'}
        </button>
      </div>

      {/* Response */}
      {result && (
        <div className="border-t border-white/10">
          {result.error && !result.status && (
            <div className="px-5 py-3 bg-red-500/10 text-red-400 text-sm">
              {result.error}
            </div>
          )}
          {result.body !== null && (
            <pre className="p-5 text-sm text-blue-300 font-mono overflow-x-auto max-h-72">
              {JSON.stringify(result.body, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
