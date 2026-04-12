import { EarlyAccessForm } from '@/components/prelaunch/EarlyAccessForm';
import { getPlatformName } from '@/lib/settings/platform-name';
import { KeyRound } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <KeyRound className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enter invite code</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Have an early-access code for {name}? Enter it below to get in.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-900/5 p-6">
          <EarlyAccessForm />
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have a code?{' '}
          <Link href="/prelaunch" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Join the waitlist
          </Link>
          {' · '}
          <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
