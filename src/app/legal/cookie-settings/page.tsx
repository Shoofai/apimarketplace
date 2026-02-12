'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Check, Info } from 'lucide-react';

interface CookiePreferences {
  essential: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  performance: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  functional: true,
  analytics: false,
  performance: true,
  marketing: false,
};

export default function CookieSettingsPage() {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load preferences from localStorage
    const stored = localStorage.getItem('cookie-preferences');
    if (stored) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      } catch (e) {
        console.error('Failed to parse cookie preferences:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    // Reload page to apply cookie changes
    window.location.reload();
  };

  const handleAcceptAll = () => {
    const allEnabled: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      performance: true,
      marketing: true,
    };
    setPreferences(allEnabled);
    localStorage.setItem('cookie-preferences', JSON.stringify(allEnabled));
    setSaved(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleRejectAll = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      performance: false,
      marketing: false,
    };
    setPreferences(essentialOnly);
    localStorage.setItem('cookie-preferences', JSON.stringify(essentialOnly));
    setSaved(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <Link href="/legal/cookies">
              <Button variant="outline" size="sm">
                Cookie Policy
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Cookie Settings</h1>
          <p className="text-lg text-muted-foreground">
            Manage your cookie preferences and control how we use cookies on your device.
          </p>
        </div>

        {saved && (
          <Alert className="mb-6 bg-success-100 dark:bg-success-900/20 border-success-500">
            <Check className="h-4 w-4 text-success-700 dark:text-success-400" />
            <AlertDescription className="text-success-700 dark:text-success-400">
              Your cookie preferences have been saved successfully.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <Button onClick={handleAcceptAll}>
            Accept All Cookies
          </Button>
          <Button variant="outline" onClick={handleRejectAll}>
            Reject Non-Essential
          </Button>
        </div>

        {/* Cookie Categories */}
        <div className="space-y-6">
          {/* Essential Cookies */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Essential Cookies
                    <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-1 rounded">
                      Always Active
                    </span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Required for the website to function. Cannot be disabled.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>These cookies are necessary for:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>User authentication and session management</li>
                  <li>Security and fraud prevention</li>
                  <li>Load balancing and performance</li>
                  <li>CSRF protection</li>
                </ul>
                <p className="text-xs mt-3">
                  <strong>Examples:</strong> Authentication tokens, security tokens, session cookies
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Functional Cookies */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>Functional Cookies</CardTitle>
                  <CardDescription className="mt-2">
                    Remember your preferences and provide enhanced functionality.
                  </CardDescription>
                </div>
                <Switch
                  checked={preferences.functional}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, functional: checked })
                  }
                  aria-label="Toggle functional cookies"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>These cookies enable:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Dark/light theme preferences</li>
                  <li>Language and region settings</li>
                  <li>UI customizations</li>
                  <li>Remember your choices</li>
                </ul>
                <p className="text-xs mt-3">
                  <strong>Examples:</strong> theme, locale, ui-preferences
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Cookies */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>Analytics Cookies</CardTitle>
                  <CardDescription className="mt-2">
                    Help us understand how visitors interact with our website.
                  </CardDescription>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, analytics: checked })
                  }
                  aria-label="Toggle analytics cookies"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>These cookies collect:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Page views and navigation paths</li>
                  <li>Time spent on pages</li>
                  <li>Click and scroll behavior</li>
                  <li>Error and performance metrics</li>
                </ul>
                <p className="text-xs mt-3">
                  <strong>Provider:</strong> Google Analytics (anonymized)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Performance Cookies */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>Performance Cookies</CardTitle>
                  <CardDescription className="mt-2">
                    Optimize site speed and user experience.
                  </CardDescription>
                </div>
                <Switch
                  checked={preferences.performance}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, performance: checked })
                  }
                  aria-label="Toggle performance cookies"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>These cookies enable:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>API response caching</li>
                  <li>CDN optimization</li>
                  <li>Resource loading preferences</li>
                  <li>Faster page loads</li>
                </ul>
                <p className="text-xs mt-3">
                  <strong>Examples:</strong> cache-control, cdn-region, resource-hints
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Marketing Cookies */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    Marketing Cookies
                    <span className="text-xs font-normal bg-muted text-muted-foreground px-2 py-1 rounded">
                      Not in use
                    </span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Show relevant advertisements and measure campaign effectiveness.
                  </CardDescription>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, marketing: checked })
                  }
                  disabled
                  aria-label="Toggle marketing cookies"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  We do not currently use marketing cookies. This setting is available for future use if we implement advertising features.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex gap-4">
          <Button onClick={handleSave} size="lg">
            Save Preferences
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">About Cookie Preferences</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your cookie preferences are stored locally on your device and will be applied across all pages of our website. You can change these settings at any time.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/legal/cookies" className="text-primary hover:underline">
              Read Cookie Policy
            </Link>
            <Link href="/legal/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            <Link href="/dashboard/settings/privacy" className="text-primary hover:underline">
              Privacy Settings
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
