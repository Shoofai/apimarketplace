import Link from 'next/link';
import { getSiteMode } from '@/lib/settings/site-mode';
import { getPlatformName } from '@/lib/settings/platform-name';
import { WaitlistSignupForm } from '@/components/prelaunch/WaitlistSignupForm';
import { Wrench, Rocket, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `${name} — Coming Soon`,
    robots: { index: false, follow: false },
  };
}

export default async function PrelaunchPage() {
  const [{ mode, message }, name] = await Promise.all([getSiteMode(), getPlatformName()]);
  const isMaintenance = mode === 'maintenance';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 px-4">
      {/* Decorative orb */}
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-300/20 to-indigo-300/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            {isMaintenance ? (
              <Wrench className="h-8 w-8 text-white" />
            ) : (
              <Rocket className="h-8 w-8 text-white" />
            )}
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {isMaintenance ? "We'll be back soon" : `${name} is coming`}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            {message ??
              (isMaintenance
                ? 'We are performing scheduled maintenance. Check back in a few minutes.'
                : 'We're putting the finishing touches on something great. Leave your email and we'll let you know when we launch.')}
          </p>
        </div>

        {/* Waitlist form — only shown in prelaunch, not maintenance */}
        {!isMaintenance && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-900/5 p-6 text-left space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              Get early access
            </h2>
            <WaitlistSignupForm />
          </div>
        )}

        {/* Bottom links */}
        <div className="flex flex-col items-center gap-3 text-sm">
          {!isMaintenance && (
            <Link
              href="/early-access"
              className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Have an invite code?
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <Link
            href="/login"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Sign in to your account
          </Link>
        </div>
      </div>
    </div>
  );
}
