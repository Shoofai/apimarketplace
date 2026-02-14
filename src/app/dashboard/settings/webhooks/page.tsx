import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Webhook, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AddWebhookForm } from './AddWebhookForm';
import { getPlatformName } from '@/lib/settings/platform-name';

export default async function WebhookManagementPage() {
  const supabase = await createClient();
  const platformName = await getPlatformName();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's organization
  const { data: userData } = await supabase
    .from('users')
    .select('current_organization_id')
    .eq('id', user.id)
    .single();

  if (!userData?.current_organization_id) {
    redirect('/dashboard');
  }

  // Get webhook endpoints
  const { data: endpoints } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('organization_id', userData.current_organization_id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Webhook Management</h1>
        <p className="text-muted-foreground">Configure webhook endpoints for event notifications</p>
      </div>

      {/* Add Webhook Endpoint */}
      <Card>
        <CardHeader>
          <CardTitle>Add Webhook Endpoint</CardTitle>
          <CardDescription>
            Receive real-time notifications about events in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddWebhookForm />
        </CardContent>
      </Card>

      {/* Existing Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Your Webhook Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          {!endpoints || endpoints.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Webhook className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No webhook endpoints configured</p>
              <p className="text-sm mt-2">Add your first endpoint above to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {endpoints.map((endpoint) => (
                <div key={endpoint.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {endpoint.url}
                        </code>
                        <Badge variant={endpoint.is_active ? 'success' : 'secondary'}>
                          {endpoint.is_active ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Disabled
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          Events: {endpoint.events?.join(', ') || 'None'}
                        </p>
                        {endpoint.last_triggered_at && (
                          <p className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last triggered:{' '}
                            {new Date(endpoint.last_triggered_at).toLocaleString()}
                          </p>
                        )}
                        {endpoint.failure_count > 0 && (
                          <p className="text-destructive">
                            {endpoint.failure_count} consecutive failure
                            {endpoint.failure_count !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                      <Button variant="outline" size="sm">
                        Logs
                      </Button>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Signature Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            All webhook requests include an HMAC-SHA256 signature in the{' '}
            <code className="bg-muted px-1 py-0.5 rounded">X-Webhook-Signature</code> header.
            Verify this signature to ensure the request came from {platformName}.
          </p>
          <div>
            <Label>Example Verification (Node.js)</Label>
            <pre className="bg-muted p-4 rounded-lg mt-2 text-xs overflow-x-auto">
              {`const crypto = require('crypto');

function verifySignature(signature, timestamp, body, secret) {
  const signatureData = \`\${timestamp}.\${body}\`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signatureData)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
