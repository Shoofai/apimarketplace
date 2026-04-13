'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Loader2 } from 'lucide-react';

export function WaitlistSignupForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    setError('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: name || undefined, role: role || undefined }),
      });

      if (res.status === 409) {
        setState('success'); // Already on waitlist — treat as success
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }

      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    }
  };

  const labelCls = dark
    ? 'text-xs text-indigo-300/80'
    : 'text-xs';
  const inputCls = dark
    ? 'bg-white/5 border-white/10 text-white placeholder:text-indigo-400/40 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50'
    : '';

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className={`h-5 w-5 ${dark ? 'text-green-400' : 'text-green-600'}`} />
        </div>
        <p className={`font-medium ${dark ? 'text-white' : 'text-gray-900 dark:text-white'}`}>You&apos;re on the list!</p>
        <p className={`text-sm ${dark ? 'text-indigo-300/70' : 'text-gray-500 dark:text-gray-400'}`}>
          We&apos;ll email you as soon as we launch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="wl-name" className={labelCls}>Name</Label>
          <Input
            id="wl-name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={state === 'loading'}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="wl-role" className={labelCls}>Role</Label>
          <Input
            id="wl-role"
            placeholder="e.g. Developer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={state === 'loading'}
            className={inputCls}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="wl-email" className={labelCls}>
          Email <span className="text-red-400">*</span>
        </Label>
        <Input
          id="wl-email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={state === 'loading'}
          className={inputCls}
        />
      </div>
      {state === 'error' && (
        <p className="text-xs text-red-400">{error}</p>
      )}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-500/25 border-0"
        disabled={state === 'loading' || !email}
      >
        {state === 'loading' ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Joining…</>
        ) : (
          'Join the waitlist →'
        )}
      </Button>
    </form>
  );
}
