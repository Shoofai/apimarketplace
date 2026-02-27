import { AdminSectionTabs } from '@/components/dashboard/AdminSectionTabs';

const BASE = '/dashboard/admin/operations';
const tabs = [
  { label: 'Security', href: `${BASE}/security` },
  { label: 'Performance', href: `${BASE}/performance` },
  { label: 'Readiness', href: `${BASE}/readiness` },
  { label: 'Health', href: `${BASE}/health` },
  { label: 'Deployment', href: `${BASE}/deployment` },
];

export default function AdminOperationsLayout({
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
