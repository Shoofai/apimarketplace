import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCircle, Shield, Clock, Building2, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', authUser.id)
    .single();

  if (!adminUser?.is_platform_admin) {
    redirect('/dashboard');
  }

  const admin = createAdminClient();

  const { data: user, error: userError } = await admin
    .from('users')
    .select('id, full_name, email, updated_at, created_at, is_platform_admin')
    .eq('id', id)
    .single();

  if (userError || !user) {
    notFound();
  }

  const { data: memberships } = await admin
    .from('organization_members')
    .select('organization_id, role, organizations(id, name, slug, type, plan)')
    .eq('user_id', id)
    .limit(DEFAULT_LIST_LIMIT);

  const displayName = user.full_name ?? user.email;
  const now = Date.now();
  const isActive24h =
    user.updated_at &&
    new Date(user.updated_at).getTime() > now - 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/people/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Details
          </h1>
          <p className="text-muted-foreground">View and manage user information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {displayName}
                  {user.is_platform_admin && (
                    <Badge variant="default">
                      <Shield className="h-3 w-3 mr-1" />
                      Platform Admin
                    </Badge>
                  )}
                  {isActive24h && (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Active (24h)
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-base">{user.email}</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">User ID</h3>
            <p className="font-mono text-sm">{user.id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Joined</h3>
            <p>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p>
          </div>
          {user.updated_at && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Last updated</h3>
              <p>{new Date(user.updated_at).toLocaleString()}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4" />
              Organizations
            </h3>
            {memberships && memberships.length > 0 ? (
              <ul className="space-y-2">
                {memberships.map((mem: { organization_id: string; role: string; organizations?: { name?: string; slug?: string; type?: string; plan?: string | null } | null }) => (
                  <li
                    key={mem.organization_id}
                    className="flex items-center gap-2 p-2 rounded-lg border bg-card"
                  >
                    <span className="font-medium">{mem.organizations?.name ?? mem.organization_id}</span>
                    <Badge variant="secondary">{mem.role}</Badge>
                    {mem.organizations?.plan && (
                      <Badge variant="outline">{mem.organizations.plan}</Badge>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No organizations</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
