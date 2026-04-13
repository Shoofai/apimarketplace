'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Loader2 } from 'lucide-react';

export function EarlyAccessForm({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    setError('');

    try {
      const res = await fetch('/api/early-access/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Invalid or expired code');
      }

      setState('success');
      // Brief pause so user sees confirmation, then redirect home
      setTimeout(() => router.push('/'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    }
  };

  const inputCls = dark
    ? 'bg-white/5 border-white/10 text-white placeholder:text-indigo-400/40 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 font-mono tracking-widest text-center text-lg'
    : 'font-mono tracking-widest text-center text-lg';
  const labelCls = dark ? 'text-xs text-indigo-300/80' : '';

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className={`h-5 w-5 ${dark ? 'text-green-400' : 'text-green-600'}`} />
        </div>
        <p className={`font-medium ${dark ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Code accepted!</p>
        <p className={`text-sm ${dark ? 'text-indigo-300/70' : 'text-gray-500 dark:text-gray-400'}`}>Taking you in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ea-code" className={labelCls}>Invite code</Label>
        <Input
          id="ea-code"
          placeholder="e.g. LAUNCH2024"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          disabled={state === 'loading'}
          className={inputCls}
        />
      </div>
      {state === 'error' && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-500/25 border-0"
        disabled={state === 'loading' || !code.trim()}
      >
        {state === 'loading' ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Checking…</>
        ) : (
          'Redeem code →'
        )}
      </Button>
    </form>
  );
}
