import { AdminSectionTabs } from '@/components/dashboard/AdminSectionTabs';

const BASE = '/dashboard/admin/apis';
const tabs = [
  { label: 'Review', href: `${BASE}/review` },
  { label: 'Claims', href: `${BASE}/claims` },
];

export default function AdminAPIsLayout({
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
