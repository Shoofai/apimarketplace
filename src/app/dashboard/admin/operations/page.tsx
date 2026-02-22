import { redirect } from 'next/navigation';

export default function AdminOperationsPage() {
  redirect('/dashboard/admin/operations/health');
}
