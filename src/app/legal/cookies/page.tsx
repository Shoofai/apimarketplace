import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Cookie Policy | ${name}`,
    description: 'Learn about how we use cookies and similar technologies',
  };
}

export default async function CookiePolicyPage() {
  const platformName = await getPlatformName();
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
            <Link href="/legal/cookie-settings">
              <Button variant="outline" size="sm">
                Cookie Settings
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Cookie Policy</h1>
          <p className="text-muted-foreground text-lg">
            <strong>Last Updated:</strong> February 12, 2026
          </p>

          <h2>Introduction</h2>
          <p>
            This Cookie Policy explains how {platformName} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses cookies and similar technologies when you visit our website and use our services. This policy should be read together with our <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>

          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and provide information to website owners.
          </p>

          <h3>Types of Cookies We Use</h3>

          <div className="space-y-6 my-6">
            <div className="border border-border rounded-lg p-6 bg-card">
              <h4 className="text-lg font-semibold mb-2">1. Essential Cookies ✅</h4>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Purpose:</strong> Required for basic website functionality
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Duration:</strong> Session or up to 1 year
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Examples:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Authentication cookies (user session)</li>
                <li>Security cookies (CSRF protection)</li>
                <li>Load balancing cookies</li>
              </ul>
              <p className="text-sm font-medium mt-3">
                ❌ <strong>Cannot be disabled</strong> - Required for site functionality
              </p>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card">
              <h4 className="text-lg font-semibold mb-2">2. Functional Cookies</h4>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Purpose:</strong> Remember your preferences and settings
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Duration:</strong> Up to 1 year
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Examples:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Theme preference (dark/light mode)</li>
                <li>Language selection</li>
                <li>Cookie consent choices</li>
              </ul>
              <p className="text-sm font-medium mt-3">
                ✅ <strong>Can be disabled</strong> via <Link href="/legal/cookie-settings" className="text-primary hover:underline">Cookie Settings</Link>
              </p>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card">
              <h4 className="text-lg font-semibold mb-2">3. Analytics Cookies</h4>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Purpose:</strong> Help us understand how visitors use our site
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Duration:</strong> Up to 2 years
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Examples:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Page views and navigation paths</li>
                <li>Time spent on pages</li>
                <li>Error monitoring</li>
              </ul>
              <p className="text-sm font-medium mt-3">
                ✅ <strong>Can be disabled</strong> via <Link href="/legal/cookie-settings" className="text-primary hover:underline">Cookie Settings</Link>
              </p>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card">
              <h4 className="text-lg font-semibold mb-2">4. Performance Cookies</h4>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Purpose:</strong> Optimize site performance and user experience
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Duration:</strong> Session or up to 1 year
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Examples:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>API response caching</li>
                <li>CDN optimization</li>
                <li>Resource loading preferences</li>
              </ul>
              <p className="text-sm font-medium mt-3">
                ✅ <strong>Can be disabled</strong> via <Link href="/legal/cookie-settings" className="text-primary hover:underline">Cookie Settings</Link>
              </p>
            </div>
          </div>

          <h2>Specific Cookies We Use</h2>
          
          <h3>Essential Cookies</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="p-3 text-left">Cookie Name</th>
                  <th className="p-3 text-left">Purpose</th>
                  <th className="p-3 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3"><code>sb-access-token</code></td>
                  <td className="p-3">Authentication</td>
                  <td className="p-3">1 hour</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3"><code>sb-refresh-token</code></td>
                  <td className="p-3">Session refresh</td>
                  <td className="p-3">7 days</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3"><code>csrf-token</code></td>
                  <td className="p-3">CSRF protection</td>
                  <td className="p-3">Session</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Functional Cookies</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="p-3 text-left">Cookie Name</th>
                  <th className="p-3 text-left">Purpose</th>
                  <th className="p-3 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3"><code>theme</code></td>
                  <td className="p-3">Dark/light mode</td>
                  <td className="p-3">1 year</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3"><code>locale</code></td>
                  <td className="p-3">Language</td>
                  <td className="p-3">1 year</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3"><code>cookie-preferences</code> (localStorage)</td>
                  <td className="p-3">Consent preferences</td>
                  <td className="p-3">Until cleared</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Note: Cookie consent choices are stored in your browser&apos;s local storage, not as a cookie, and are used to control whether we store analytics data.
          </p>

          <h2>How to Control Cookies</h2>
          
          <h3>Cookie Settings Page</h3>
          <p>
            Visit our <Link href="/legal/cookie-settings" className="text-primary hover:underline">Cookie Settings</Link> page to:
          </p>
          <ul>
            <li>Enable/disable functional cookies</li>
            <li>Enable/disable analytics cookies</li>
            <li>Enable/disable performance cookies</li>
            <li>View your current preferences</li>
            <li>Update your choices at any time</li>
          </ul>

          <h3>Browser Settings</h3>
          <p>Most browsers allow you to control cookies through their settings:</p>
          <ul>
            <li><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies</li>
            <li><strong>Firefox:</strong> Settings &gt; Privacy & Security &gt; Cookies</li>
            <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Cookies</li>
            <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions</li>
          </ul>

          <h2>Your Rights</h2>
          <p>Under GDPR and other privacy laws, you have the right to:</p>
          <ol>
            <li>Know what cookies we use</li>
            <li>Choose which cookies to accept</li>
            <li>Access your data</li>
            <li>Delete your data</li>
            <li>Object to processing</li>
          </ol>

          <p>
            To exercise these rights, visit <Link href="/dashboard/settings/privacy" className="text-primary hover:underline">Privacy Settings</Link> or contact us at privacy@apimarketplace.pro.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>If you have questions about our use of cookies:</p>
          <ul>
            <li><strong>Email:</strong> privacy@apimarketplace.pro</li>
            <li><strong>Cookie Settings:</strong> <Link href="/legal/cookie-settings" className="text-primary hover:underline">Manage Preferences</Link></li>
            <li><strong>Privacy Portal:</strong> <Link href="/dashboard/settings/privacy" className="text-primary hover:underline">Privacy Settings</Link></li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 flex gap-4 flex-wrap">
          <Link href="/legal/cookie-settings">
            <Button>Manage Cookie Preferences</Button>
          </Link>
          <Link href="/legal/privacy">
            <Button variant="outline">Privacy Policy</Button>
          </Link>
          <Link href="/legal/terms">
            <Button variant="outline">Terms of Service</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
