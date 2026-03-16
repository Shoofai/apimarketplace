'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { usePlatformName } from '@/contexts/PlatformNameContext';

export default function VerifyEmailPage() {
  const supabase = useSupabase();
  const platformName = usePlatformName();
  const router = useRouter();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  // Poll for email verification every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setVerified(true);
        clearInterval(interval);
        setTimeout(() => router.push('/dashboard'), 1500);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [supabase, router]);

  const handleResend = async () => {
    setResendLoading(true);
    setResendError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;
      if (!email) {
        setResendError('Unable to find your email address. Please go back to sign in.');
        return;
      }
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      setResendSent(true);
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setResendLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold">Email verified!</h2>
        <p className="text-muted-foreground">Redirecting you to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Verify your email</h2>
        <p className="text-muted-foreground mt-2">
          We&apos;ve sent a verification link to your email
        </p>
      </div>

      <Alert>
        <AlertDescription>
          Please check your inbox and click the verification link to activate your account.
          You may need to check your spam folder.
        </AlertDescription>
      </Alert>

      {resendError && (
        <Alert variant="destructive">
          <AlertDescription>{resendError}</AlertDescription>
        </Alert>
      )}

      {resendSent && (
        <Alert>
          <AlertDescription>Verification email resent! Check your inbox.</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <p className="text-sm text-center text-muted-foreground">
          Once verified, you&apos;ll be automatically redirected to {platformName}.
        </p>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={resendLoading || resendSent}
        >
          {resendLoading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
          ) : resendSent ? (
            'Email sent!'
          ) : (
            'Resend verification email'
          )}
        </Button>

        <Button variant="ghost" className="w-full" asChild>
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
