import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Ticket, Search, Clock, User, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { TicketsTable } from './TicketsTable';

const PAGE_SIZE = 25;

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const resolved = await searchParams;
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
  const page = Math.max(1, parseInt(resolved.page || '1', 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = admin
    .from('support_tickets')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (resolved.q?.trim()) {
    const q = resolved.q.trim();
    query = query.or(`ticket_number.ilike.%${q}%,submitter_email.ilike.%${q}%,subject.ilike.%${q}%`);
  }

  if (resolved.status?.trim()) {
    query = query.eq('status', resolved.status.trim());
  }

  const { data: tickets, count: totalCount } = await query;

  const { count: newCount } = await admin
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');

  const { count: totalTickets } = await admin
    .from('support_tickets')
    .select('*', { count: 'exact', head: true });

  const totalForPage = totalCount ?? 0;
  const totalPages = Math.ceil(totalForPage / PAGE_SIZE) || 1;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            Support Tickets
          </h1>
          <p className="text-muted-foreground">Manage contact form submissions and support requests</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalTickets || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{newCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {page} / {totalPages}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>Filter and search support tickets</CardDescription>
            </div>
            <form method="get" className="flex gap-2 flex-1 sm:max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  name="q"
                  placeholder={`Search ${(totalTickets ?? 0).toLocaleString()} tickets...`}
                  defaultValue={resolved.q}
                  className="pl-9"
                  aria-label="Search tickets by number, email, or subject"
                />
              </div>
              <select
                name="status"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={resolved.status ?? ''}
              >
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_customer">Waiting Customer</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                Search
              </button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <TicketsTable tickets={tickets ?? []} />
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {from + 1}–{Math.min(to + 1, totalForPage)} of {totalForPage}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/dashboard/admin/support/tickets?page=${page - 1}${resolved.q ? `&q=${encodeURIComponent(resolved.q)}` : ''}${resolved.status ? `&status=${resolved.status}` : ''}`}
                  >
                    <span className="text-sm text-primary hover:underline">Previous</span>
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/dashboard/admin/support/tickets?page=${page + 1}${resolved.q ? `&q=${encodeURIComponent(resolved.q)}` : ''}${resolved.status ? `&status=${resolved.status}` : ''}`}
                  >
                    <span className="text-sm text-primary hover:underline">Next</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
