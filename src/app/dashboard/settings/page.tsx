import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Building2,
  Key,
  CreditCard,
  Bell,
  Webhook,
  Shield,
  Lock,
  ChevronRight,
  Cookie,
  Settings,
} from 'lucide-react';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const settingsSections = [
    {
      title: 'Profile',
      description: 'Manage your personal information and preferences',
      icon: User,
      href: '/dashboard/settings/profile',
      badge: null,
    },
    {
      title: 'Organization',
      description: 'Manage organization settings and team members',
      icon: Building2,
      href: '/dashboard/settings/organization',
      badge: null,
    },
    {
      title: 'API Keys',
      description: 'Generate and manage API keys for authentication',
      icon: Key,
      href: '/dashboard/settings/api-keys',
      badge: null,
    },
    {
      title: 'Billing',
      description: 'Payment methods, invoices, and usage caps',
      icon: CreditCard,
      href: '/dashboard/settings/billing',
      badge: null,
    },
    {
      title: 'Notifications',
      description: 'Configure email and in-app notifications',
      icon: Bell,
      href: '/dashboard/settings/notifications',
      badge: null,
    },
    {
      title: 'Webhooks',
      description: 'Set up webhooks for API events',
      icon: Webhook,
      href: '/dashboard/settings/webhooks',
      badge: null,
    },
    {
      title: 'Privacy',
      description: 'Data privacy and compliance settings',
      icon: Shield,
      href: '/dashboard/settings/privacy',
      badge: null,
    },
    {
      title: 'Security',
      description: 'Two-factor authentication and session management',
      icon: Lock,
      href: '/dashboard/settings/security',
      badge: null,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
        <Settings className="h-8 w-8" />
        Settings
      </h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Sections Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        {section.badge && (
                          <span className="text-xs text-muted-foreground">
                            {section.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardDescription className="mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common settings tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Account</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/dashboard/settings/profile">
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </Link>
              <Link href="/dashboard/settings/organization">
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="h-4 w-4 mr-2" />
                  Organization Settings
                </Button>
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Billing & Security</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/dashboard/settings/billing">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
              </Link>
              <Link href="/dashboard/settings/security">
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  Two-Factor Authentication
                </Button>
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Integrations & Privacy</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/dashboard/settings/api-keys">
                <Button variant="outline" className="w-full justify-start">
                  <Key className="h-4 w-4 mr-2" />
                  Generate API Key
                </Button>
              </Link>
              <Link href="/dashboard/settings/notifications">
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
              </Link>
              <Link href="/dashboard/settings/webhooks">
                <Button variant="outline" className="w-full justify-start">
                  <Webhook className="h-4 w-4 mr-2" />
                  Webhooks
                </Button>
              </Link>
              <Link href="/dashboard/settings/privacy">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy & Data
                </Button>
              </Link>
              <Link href="/legal/cookie-settings">
                <Button variant="outline" className="w-full justify-start">
                  <Cookie className="h-4 w-4 mr-2" />
                  Cookie Preferences
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
