'use client';

import { useState, useId } from 'react';
import { cn } from '@/lib/utils';

interface GeneratedCode {
  code: string;
  language: string;
  framework?: string | null;
  install_command: string;
  file_extension: string;
  generation_id?: string | null;
}

const LANGUAGES = [
  { id: 'typescript', label: 'TypeScript', icon: '🔷' },
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'javascript', label: 'JavaScript', icon: '🟨' },
  { id: 'go', label: 'Go', icon: '🔵' },
  { id: 'curl', label: 'cURL', icon: '📟' },
] as const;

type LangId = (typeof LANGUAGES)[number]['id'];

export interface CodeGenEndpoint {
  method: string;
  path: string;
  summary: string;
}

export interface EndpointSchema {
  requestBodySchema?: unknown;
  responseSchema?: unknown;
}

interface InstantCodeGeneratorProps {
  apiName: string;
  apiBaseUrl?: string;
  endpoints: CodeGenEndpoint[];
  apiId?: string;
  developerId?: string;
  sessionId?: string;
  className?: string;
  /** OpenAPI-derived request/response schemas keyed by `METHOD:path` (e.g. "POST:/users") */
  endpointSchemas?: Record<string, EndpointSchema>;
}

export function InstantCodeGenerator({
  apiName,
  apiBaseUrl = '',
  endpoints,
  apiId,
  developerId,
  sessionId,
  className,
  endpointSchemas,
}: InstantCodeGeneratorProps) {
  const instanceId = useId();
  const [language, setLanguage] = useState<LangId>('typescript');
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use a stable per-session anonymous id for tracking anonymous usage
  const anonSessionId =
    sessionId ??
    (typeof window !== 'undefined'
      ? (sessionStorage.getItem('codegen_session') ??
        (() => {
          const id = crypto.randomUUID();
          try { sessionStorage.setItem('codegen_session', id); } catch {}
          return id;
        })())
      : undefined);

  const generateCode = async () => {
    if (endpoints.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const endpoint = endpoints[selectedEndpoint] ?? endpoints[0];
      const schemaKey = `${endpoint.method.toUpperCase()}:${endpoint.path}`;
      const schema = endpointSchemas?.[schemaKey];
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_name: apiName,
          api_base_url: apiBaseUrl,
          endpoint_path: endpoint.path,
          http_method: endpoint.method,
          language,
          api_id: apiId ?? null,
          developer_id: developerId ?? null,
          session_id: anonSessionId ?? null,
          request_body_schema: schema?.requestBodySchema ?? null,
          response_schema: schema?.responseSchema ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? 'Generation failed');
        return;
      }
      setGeneratedCode(data as GeneratedCode);
    } catch {
      setError('Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Mark as copied in DB (fire-and-forget)
      if (generatedCode.generation_id) {
        fetch('/api/generate-code/mark-copied', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ generation_id: generatedCode.generation_id }),
        }).catch(() => {});
      }
    } catch {}
  };

  const selectId = `${instanceId}-endpoint`;

  return (
    <div className={cn('rounded-2xl border border-white/10 bg-gray-900 overflow-hidden', className)}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <span>⚡</span> AI-Powered Integration Code
        </h3>
        <p className="text-white/50 text-sm mt-0.5">
          Select an endpoint and language — get production-ready code instantly
        </p>
      </div>

      {/* Controls */}
      <div className="px-5 py-4 space-y-4">
        {/* Endpoint selector */}
        <div>
          <label htmlFor={selectId} className="block text-white/60 text-xs mb-1">
            Endpoint
          </label>
          <select
            id={selectId}
            value={selectedEndpoint}
            onChange={(e) => {
              setSelectedEndpoint(Number(e.target.value));
              setGeneratedCode(null);
            }}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
          >
            {endpoints.map((ep, i) => (
              <option key={i} value={i}>
                {ep.method.toUpperCase()} {ep.path}
                {ep.summary ? ` — ${ep.summary}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Language selector */}
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => {
                setLanguage(lang.id);
                setGeneratedCode(null);
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition',
                language === lang.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              )}
            >
              {lang.icon} {lang.label}
            </button>
          ))}
        </div>

        {/* Generate button */}
        <button
          type="button"
          onClick={generateCode}
          disabled={loading || endpoints.length === 0}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
              </svg>
              Generating with AI...
            </span>
          ) : (
            'Generate Integration Code ⚡'
          )}
        </button>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>

      {/* Code output */}
      {generatedCode && (
        <div className="border-t border-white/10">
          {/* Install command */}
          {generatedCode.install_command && (
            <div className="px-5 py-2 bg-yellow-500/10 border-b border-white/10">
              <span className="text-yellow-400 text-xs font-mono">
                $ {generatedCode.install_command}
              </span>
            </div>
          )}

          {/* Code block */}
          <div className="relative">
            <button
              type="button"
              onClick={copyCode}
              className="absolute top-3 right-3 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-md transition z-10"
            >
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
            <pre className="p-5 text-sm text-green-400 font-mono overflow-x-auto max-h-96 scrollbar-thin">
              <code>{generatedCode.code}</code>
            </pre>
          </div>

          {/* CTA: Sign up to save and test */}
          {!developerId && (
            <div className="px-5 py-4 bg-blue-500/10 border-t border-blue-500/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-white font-medium text-sm">Want to test this live?</p>
                  <p className="text-white/50 text-xs mt-0.5">
                    Sign up free — get an API key and test in our sandbox
                  </p>
                </div>
                <a
                  href="/signup?ref=code_gen"
                  className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition whitespace-nowrap"
                >
                  Sign Up Free →
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
