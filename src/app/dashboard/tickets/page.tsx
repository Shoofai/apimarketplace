import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default async function MyTicketsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('id, ticket_number, subject, status, created_at')
    .or(`submitter_user_id.eq.${user.id},submitter_email.eq.${user.email}`)
    .order('created_at', { ascending: false });

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    assigned: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    in_progress: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    waiting_customer: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    resolved: 'bg-green-500/10 text-green-700 dark:text-green-400',
    closed: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Ticket className="h-8 w-8" />
          My Tickets
        </h1>
        <p className="text-muted-foreground">
          View your support requests and contact form submissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Tickets</CardTitle>
          <CardDescription>
            Support requests you&apos;ve submitted via the contact form
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!tickets?.length ? (
            <div className="py-12 text-center text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>You haven&apos;t submitted any tickets yet.</p>
              <Link href="/contact" className="mt-4 inline-block text-primary hover:underline">
                Contact us
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <Link
                  key={t.id}
                  href={`/dashboard/tickets/${t.id}`}
                  className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-medium">{t.ticket_number}</p>
                      <p className="text-sm text-muted-foreground truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(t.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className={statusColors[t.status] || ''}>
                      {t.status.replace('_', ' ')}
                    </Badge>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
