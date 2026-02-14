import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCircle, Search, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

const PAGE_SIZE = 25;

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
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

  const admin = createAdminClient();
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = admin
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (searchParams.q?.trim()) {
    const q = searchParams.q.trim();
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: users, count: filteredCount } = await query;

  const { count: totalUsers } = await admin
    .from('users')
    .select('*', { count: 'exact', head: true });

  const now = Date.now();
  const activeSince = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const { count: activeUsers } = await admin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('last_active_at', activeSince);

  const { count: adminCount } = await admin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('is_platform_admin', true);

  const totalForPage = filteredCount ?? 0;
  const totalPages = Math.ceil(totalForPage / PAGE_SIZE) || 1;
  const showFrom = users?.length ? from + 1 : 0;
  const showTo = from + (users?.length ?? 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage platform users and permissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active (24h)</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Admins</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>Search by name or email. Results are paginated.</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get" className="flex gap-2">
            <input type="hidden" name="page" value="1" />
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search users..."
                defaultValue={searchParams.q}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            {searchParams.q?.trim() && (
              <Link href="/dashboard/admin/users">
                <Button type="button" variant="outline">
                  Clear
                </Button>
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {totalForPage > 0
              ? `Showing ${showFrom}–${showTo} of ${totalForPage.toLocaleString()}`
              : 'No users to display'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>
                {searchParams.q?.trim()
                  ? `No users match "${searchParams.q.trim()}". Clear the search to see all users.`
                  : 'No users found'}
              </p>
              {searchParams.q?.trim() && (
                <Link href="/dashboard/admin/users">
                  <Button variant="outline" size="sm" className="mt-4">
                    Clear search
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left font-medium p-3">Name</th>
                      <th className="text-left font-medium p-3">Email</th>
                      <th className="text-left font-medium p-3 w-24">Role</th>
                      <th className="text-left font-medium p-3 w-20">Status</th>
                      <th className="text-left font-medium p-3">Joined</th>
                      <th className="text-right font-medium p-3 w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3 font-medium">{u.full_name || '—'}</td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3">
                          {u.is_platform_admin ? (
                            <Badge variant="default" className="text-xs">
                              <Shield className="h-3 w-3 mr-1 inline" />
                              Admin
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          {u.last_active_at &&
                          new Date(u.last_active_at).getTime() > now - 24 * 60 * 60 * 1000 ? (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1 inline" />
                              Active
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-3 text-right">
                          <Link href={`/dashboard/admin/users/${u.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={
                        page > 1
                          ? `/dashboard/admin/users?${new URLSearchParams({
                              ...(searchParams.q?.trim() && { q: searchParams.q.trim() }),
                              page: String(page - 1),
                            })}`
                          : '#'
                      }
                    >
                      <Button variant="outline" size="sm" disabled={page <= 1}>
                        Previous
                      </Button>
                    </Link>
                    <Link
                      href={
                        page < totalPages
                          ? `/dashboard/admin/users?${new URLSearchParams({
                              ...(searchParams.q?.trim() && { q: searchParams.q.trim() }),
                              page: String(page + 1),
                            })}`
                          : '#'
                      }
                    >
                      <Button variant="outline" size="sm" disabled={page >= totalPages}>
                        Next
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
