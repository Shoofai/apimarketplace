import { EarlyAccessForm } from '@/components/prelaunch/EarlyAccessForm';
import { getPlatformName } from '@/lib/settings/platform-name';
import { KeyRound, Zap } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Early Access — ${name}`,
    robots: { index: false, follow: false },
  };
}

export default async function EarlyAccessPage() {
  const name = await getPlatformName();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 flex flex-col overflow-hidden">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-3xl" />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <Link href="/prelaunch" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">{name}</span>
        </Link>
        <Link href="/login" className="text-sm text-indigo-300 hover:text-white transition-colors">
          Sign in →
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <KeyRound className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Enter invite code</h1>
            <p className="text-sm text-indigo-300/70">
              Have an early-access code for {name}? Enter it below to get in.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <EarlyAccessForm dark />
          </div>

          <p className="text-center text-sm text-indigo-400/60">
            Don&apos;t have a code?{' '}
            <Link href="/prelaunch" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Join the waitlist
            </Link>
            {' · '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
