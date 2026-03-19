'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';

interface MFAVerifyStepProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MFAVerifyStep({
  onSuccess,
  onCancel,
}: MFAVerifyStepProps) {
  const supabase = useSupabase();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function loadFactors() {
      try {
        const { data, error: listError } =
          await supabase.auth.mfa.listFactors();

        if (listError) throw listError;

        const totpFactor = data?.totp?.[0];
        if (!totpFactor) {
          setError('No authenticator factor found. Please contact support.');
          return;
        }

        setFactorId(totpFactor.id);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load authentication factors'
        );
      } finally {
        setInitializing(false);
      }
    }

    loadFactors();
  }, [supabase]);

  const handleVerify = async () => {
    if (code.length !== 6 || !factorId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) throw verifyError;

      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Verification failed';

      if (message.toLowerCase().includes('invalid')) {
        setError('Invalid code. Please check your authenticator app and try again.');
      } else {
        setError(message);
      }

      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6 && !loading) {
      handleVerify();
    }
  };

  if (initializing) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Two-Factor Authentication
        </h2>
        <div className="mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-primary to-accent" />
        <p className="text-muted-foreground mt-4">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Open your authenticator app (e.g. Google Authenticator, Authy) and
            enter the verification code for Apinergy.
          </p>
        </div>

        <div className="space-y-2">
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(val);
            }}
            onKeyDown={handleKeyDown}
            className="font-mono text-center text-2xl tracking-[0.5em] h-14"
            autoFocus
            disabled={loading}
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          className="w-full font-medium bg-gradient-to-r from-primary to-accent text-primary-foreground shadow hover:opacity-90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>

        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
