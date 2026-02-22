import { AdminSectionTabs } from '@/components/dashboard/AdminSectionTabs';

const BASE = '/dashboard/analytics';
const tabs = [
  { label: 'Usage', href: `${BASE}/usage` },
  { label: 'Cost intelligence', href: `${BASE}/cost-intelligence` },
  { label: 'Provider', href: `${BASE}/provider` },
];

export default function AnalyticsLayout({
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
