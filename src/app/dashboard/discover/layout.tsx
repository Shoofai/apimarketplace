import { AdminSectionTabs } from '@/components/dashboard/AdminSectionTabs';

const BASE = '/dashboard/discover';
const tabs = [
  { label: 'Subscriptions', href: `${BASE}/subscriptions` },
  { label: 'Favorites', href: `${BASE}/favorites` },
  { label: 'Collections', href: `${BASE}/collections` },
  { label: 'Challenges', href: `${BASE}/challenges` },
  { label: 'Forum', href: `${BASE}/forum` },
  { label: 'Referrals', href: `${BASE}/referrals` },
];

export default function DiscoverLayout({
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
