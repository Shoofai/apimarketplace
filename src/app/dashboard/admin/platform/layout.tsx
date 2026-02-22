import { AdminSectionTabs } from '@/components/dashboard/AdminSectionTabs';

const BASE = '/dashboard/admin/platform';
const tabs = [
  { label: 'Settings', href: `${BASE}/settings` },
  { label: 'Feature flags', href: `${BASE}/feature-flags` },
];

export default function AdminPlatformLayout({
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
