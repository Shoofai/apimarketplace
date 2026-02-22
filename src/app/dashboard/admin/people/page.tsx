import { redirect } from 'next/navigation';

export default function AdminPeoplePage() {
  redirect('/dashboard/admin/people/users');
}
