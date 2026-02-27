import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminSupportPage() {
  redirect('/dashboard/admin/support/tickets');
}
