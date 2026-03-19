'use client';

import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Smartphone,
  ShieldCheck,
  ShieldOff,
  Loader2,
  CheckCircle2,
  Copy,
  AlertTriangle,
} from 'lucide-react';

interface MFAEnrollCardProps {
  isEnrolled: boolean;
  factorId?: string;
}

type EnrollStep = 'idle' | 'qr' | 'success' | 'disable-confirm';

export default function MFAEnrollCard({
  isEnrolled: initialEnrolled,
  factorId: initialFactorId,
}: MFAEnrollCardProps) {
  const supabase = useSupabase();

  const [isEnrolled, setIsEnrolled] = useState(initialEnrolled);
  const [factorId, setFactorId] = useState(initialFactorId);
  const [step, setStep] = useState<EnrollStep>('idle');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });

      if (enrollError) throw enrollError;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStep('qr');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to start 2FA enrollment'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6 || !factorId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });

      if (verifyError) throw verifyError;

      setIsEnrolled(true);
      setStep('success');
      setVerifyCode('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid verification code'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!factorId) return;

    setLoading(true);
    setError(null);

    try {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (unenrollError) throw unenrollError;

      setIsEnrolled(false);
      setFactorId(undefined);
      setStep('idle');
      setQrCode(null);
      setSecret(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to disable 2FA'
      );
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  // Idle state: show enable/disable button
  if (step === 'idle') {
    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-4 p-4 border rounded-lg">
          <div className="p-3 rounded-lg bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Authenticator App</p>
            <p className="text-sm text-muted-foreground">
              {isEnrolled
                ? 'Your account is protected with two-factor authentication'
                : 'Use an authenticator app like Google Authenticator or Authy'}
            </p>
          </div>
          {isEnrolled ? (
            <Button
              variant="destructive"
              onClick={() => setStep('disable-confirm')}
              disabled={loading}
            >
              <ShieldOff className="mr-2 h-4 w-4" />
              Disable
            </Button>
          ) : (
            <Button onClick={handleEnroll} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Enable
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Disable confirmation
  if (step === 'disable-confirm') {
    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="p-4 border border-destructive/50 rounded-lg space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium">Disable Two-Factor Authentication?</p>
              <p className="text-sm text-muted-foreground mt-1">
                This will remove the extra layer of security from your account.
                You can re-enable it at any time.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setStep('idle');
                setError(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnenroll}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldOff className="mr-2 h-4 w-4" />
              )}
              Disable 2FA
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // QR code + verification step
  if (step === 'qr') {
    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="p-4 border rounded-lg space-y-6">
          <div>
            <p className="font-medium">Step 1: Scan QR Code</p>
            <p className="text-sm text-muted-foreground mt-1">
              Open your authenticator app and scan this QR code to add your
              account.
            </p>
          </div>

          {qrCode && (
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCode}
                  alt="QR Code for 2FA setup"
                  width={200}
                  height={200}
                />
              </div>
            </div>
          )}

          {secret && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Can&apos;t scan? Enter this code manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                  {secret}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySecret}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                  {secretCopied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="font-medium">Step 2: Enter Verification Code</p>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app to complete
              setup.
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerifyCode(val);
                }}
                className="font-mono text-center text-lg tracking-widest max-w-[180px]"
                autoFocus
              />
              <Button
                onClick={handleVerify}
                disabled={loading || verifyCode.length !== 6}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                Verify
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setStep('idle');
                setQrCode(null);
                setSecret(null);
                setVerifyCode('');
                setError(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (step === 'success') {
    return (
      <div className="space-y-4">
        <div className="p-4 border border-green-500/30 bg-green-500/5 rounded-lg space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">
                Two-Factor Authentication Enabled
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your account is now protected with an additional layer of
                security. You will be asked for a verification code when you
                sign in.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setStep('idle')}>
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
