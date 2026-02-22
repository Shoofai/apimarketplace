import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, AlertTriangle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CancelDeletionButton } from '@/components/privacy/CancelDeletionButton';

export default async function PrivacySettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get export requests
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();

  const { data: exportRequests } = await supabase
    .from('data_export_requests')
    .select('id, user_id, status, requested_at, completed_at, export_url, expires_at, created_at')
    .eq('user_id', userData?.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: deletionRequest } = await supabase
    .from('data_deletion_requests')
    .select('id, user_id, status, grace_period_ends_at, requested_at, created_at')
    .eq('user_id', userData?.id)
    .eq('status', 'grace_period')
    .maybeSingle();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Privacy & Data
        </h1>
        <p className="text-muted-foreground">Manage your data and privacy settings</p>
      </div>

      {/* Active Deletion Request Alert */}
      {deletionRequest && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Account Deletion Scheduled</CardTitle>
            </div>
            <CardDescription>
              Your account will be permanently deleted on{' '}
              {new Date(deletionRequest.grace_period_ends_at).toLocaleDateString()}. You can
              cancel this request before that date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CancelDeletionButton requestId={deletionRequest.id} />
          </CardContent>
        </Card>
      )}

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Your Data
          </CardTitle>
          <CardDescription>
            Request a copy of all your personal data (GDPR Right to Access). You&apos;ll receive a
            download link via email within 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action="/api/gdpr/export" method="POST">
            <Button>Request Data Export</Button>
          </form>

          {exportRequests && exportRequests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Requests</h4>
              {exportRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="text-sm">
                      {new Date(req.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        const bytes = (req as unknown as { file_size_bytes?: number }).file_size_bytes;
                        return bytes != null ? `${(bytes / 1024).toFixed(1)} KB` : 'Processing...';
                      })()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      req.status === 'ready'
                        ? 'success'
                        : req.status === 'processing'
                          ? 'default'
                          : 'secondary'
                    }
                  >
                    {req.status}
                  </Badge>
                  {req.status === 'ready' && req.export_url && (
                    <Button size="sm" asChild>
                      <a href={req.export_url} download>
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Deletion */}
      {!deletionRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Your Account
            </CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data (GDPR Right to Erasure).
              This action cannot be undone after the 30-day grace period.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h4 className="font-medium mb-2">What will be deleted:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Your user profile and account information</li>
                <li>All API subscriptions and API keys</li>
                <li>Usage history and analytics</li>
                <li>Notifications and preferences</li>
                <li>AI playground sessions and generated code</li>
              </ul>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium mb-2">What will be retained:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Financial records (invoices) for 7 years (legal requirement)</li>
                <li>Anonymized usage statistics</li>
                <li>Audit logs (anonymized)</li>
              </ul>
            </div>

            <form action="/api/gdpr/delete" method="POST">
              <Button variant="destructive">Request Account Deletion</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Cookie Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Cookie Preferences</CardTitle>
          <CardDescription>
            Manage how we use cookies and tracking technologies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/legal/cookie-settings">Manage Cookie Settings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
