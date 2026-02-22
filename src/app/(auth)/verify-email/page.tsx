import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';

export default async function VerifyEmailPage() {
  const platformName = await getPlatformName();
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-primary-600" />
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

      <div className="space-y-4">
        <p className="text-sm text-center text-muted-foreground">
          Once verified, you&apos;ll be able to sign in and start using {platformName}.
        </p>

        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
