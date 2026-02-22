import { AdminSectionTabs } from '@/components/dashboard/AdminSectionTabs';

const BASE = '/dashboard/admin/people';
const tabs = [
  { label: 'Users', href: `${BASE}/users` },
  { label: 'Organizations', href: `${BASE}/organizations` },
  { label: 'Verification', href: `${BASE}/verification` },
];

export default function AdminPeopleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminSectionTabs tabs={tabs} basePath={BASE} />
      {children}
    </>
  );
}
