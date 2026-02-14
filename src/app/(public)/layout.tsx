import { PublicNav } from '@/components/landing/PublicNav';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <div className="pt-16">{children}</div>
    </div>
  );
}
