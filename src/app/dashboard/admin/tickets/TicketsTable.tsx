import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';

interface Ticket {
  id: string;
  ticket_number: string;
  submitter_email: string;
  submitter_name: string | null;
  subject: string;
  status: string;
  priority: string | null;
  inquiry_type: string;
  category: string;
  created_at: string | null;
}

export function TicketsTable({ tickets }: { tickets: Ticket[] }) {
  if (!tickets.length) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No tickets found.
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    assigned: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    in_progress: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    waiting_customer: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    resolved: 'bg-green-500/10 text-green-700 dark:text-green-400',
    closed: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2 font-medium">Ticket</th>
            <th className="text-left py-3 px-2 font-medium">From</th>
            <th className="text-left py-3 px-2 font-medium">Subject</th>
            <th className="text-left py-3 px-2 font-medium">Category</th>
            <th className="text-left py-3 px-2 font-medium">Status</th>
            <th className="text-left py-3 px-2 font-medium">Created</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-2 font-mono text-xs">{t.ticket_number}</td>
              <td className="py-3 px-2">
                <div>{t.submitter_name || t.submitter_email}</div>
                {t.submitter_name && (
                  <div className="text-xs text-muted-foreground">{t.submitter_email}</div>
                )}
              </td>
              <td className="py-3 px-2 max-w-[200px] truncate" title={t.subject}>
                {t.subject}
              </td>
              <td className="py-3 px-2 text-muted-foreground">
                {t.inquiry_type} / {t.category}
              </td>
              <td className="py-3 px-2">
                <Badge variant="secondary" className={statusColors[t.status] || ''}>
                  {t.status.replace('_', ' ')}
                </Badge>
              </td>
              <td className="py-3 px-2 text-muted-foreground">
                {t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}
              </td>
              <td className="py-3 px-2">
                <Link
                  href={`/dashboard/admin/tickets/${t.id}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
