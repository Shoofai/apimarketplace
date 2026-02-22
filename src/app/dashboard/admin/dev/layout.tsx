import { AdminSectionTabs } from '@/components/dashboard/AdminSectionTabs';

const BASE = '/dashboard/admin/dev';
const tabs = [
  { label: 'Demo & data', href: `${BASE}/demo` },
  { label: 'Tracker', href: `${BASE}/tracker` },
  { label: 'Changelog', href: `${BASE}/changelog` },
  { label: 'Git notes', href: `${BASE}/git-notes` },
];

export default function AdminDevLayout({
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
