import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Globe, DollarSign } from 'lucide-react';

export default async function OrganizationManagementPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    redirect('/dashboard');
  }

  // Get organizations with member counts and API counts
  const { data: organizations } = await supabase
    .from('organizations')
    .select(
      `
      *,
      members:organization_members(count),
      apis(count),
      subscriptions:api_subscriptions(count)
    `
    )
    .order('created_at', { ascending: false })
    .limit(50);

  const { count: totalOrgs } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true });

  const providerCount = organizations?.filter((o) => o.type === 'provider').length || 0;
  const developerCount = organizations?.filter((o) => o.type === 'developer').length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Organization Management</h1>
        <p className="text-muted-foreground">Manage organizations and plans</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orgs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrgs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Providers</CardTitle>
            <Globe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providerCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Developers</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{developerCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enterprise</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations?.filter((o) => o.plan === 'enterprise').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization List */}
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations?.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{org.name}</h3>
                    <Badge variant={org.plan === 'enterprise' ? 'default' : 'secondary'}>
                      {org.plan}
                    </Badge>
                    <Badge variant="outline">{org.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{org.slug}</p>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>
                      {org.members?.[0]?.count || 0} member
                      {org.members?.[0]?.count !== 1 ? 's' : ''}
                    </span>
                    <span>
                      {org.apis?.[0]?.count || 0} API{org.apis?.[0]?.count !== 1 ? 's' : ''}
                    </span>
                    <span>
                      {org.subscriptions?.[0]?.count || 0} subscription
                      {org.subscriptions?.[0]?.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
