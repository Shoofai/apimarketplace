import { AdminSectionTabs } from '@/components/dashboard/AdminSectionTabs';

const BASE = '/dashboard/developer';
const tabs = [
  { label: 'API Builder', href: `${BASE}/api-builder` },
  { label: 'Sandbox', href: `${BASE}/sandbox` },
  { label: 'Playground', href: `${BASE}/playground` },
  { label: 'Collaborative Testing', href: `${BASE}/collab` },
  { label: 'Workflows', href: `${BASE}/workflows` },
];

export default function DeveloperLayout({
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
