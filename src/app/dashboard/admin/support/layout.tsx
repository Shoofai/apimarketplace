import { AdminSectionTabs } from '@/components/dashboard/AdminSectionTabs';

const BASE = '/dashboard/admin/support';
const tabs = [
  { label: 'Tickets', href: `${BASE}/tickets` },
  { label: 'Moderation', href: `${BASE}/moderation` },
];

export default function AdminSupportLayout({
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
