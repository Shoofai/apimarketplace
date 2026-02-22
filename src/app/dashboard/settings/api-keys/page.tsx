import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Copy, Eye, EyeOff, Trash2, Key } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default async function APIKeysPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Mock API keys data - in production, fetch from api_keys table
  const apiKeys = [
    {
      id: '1',
      name: 'Production Key',
      key: 'sk_live_••••••••••••••••',
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href="/dashboard/settings">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6" />
            API Keys
          </h1>
          <p className="text-muted-foreground">
            Manage API keys for authentication
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Generate New Key
        </Button>
      </div>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Use these keys to authenticate API requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No API keys yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">{key.name}</p>
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                    </div>
                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                      {key.key}
                    </code>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        Created {new Date(key.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        Last used {new Date(key.last_used).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-warning/50 bg-warning/5">
        <CardHeader>
          <CardTitle className="text-base">Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Never share your API keys publicly</li>
            <li>Rotate keys regularly for enhanced security</li>
            <li>Use environment variables to store keys</li>
            <li>Revoke unused keys immediately</li>
            <li>Monitor API key usage for suspicious activity</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
