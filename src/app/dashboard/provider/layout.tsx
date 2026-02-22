import { AdminSectionTabs } from '@/components/dashboard/AdminSectionTabs';

const BASE = '/dashboard/provider';
const tabs = [
  { label: 'My APIs', href: `${BASE}/apis` },
  { label: 'Analytics', href: '/dashboard/analytics/provider' },
  { label: 'Affiliates', href: `${BASE}/affiliates` },
];

export default function ProviderLayout({
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
