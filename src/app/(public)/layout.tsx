import { PublicNav } from '@/components/landing/PublicNav';
import Footer from '@/components/landing/Footer';

export const dynamic = 'force-dynamic';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <div className="pt-[calc(4rem+env(safe-area-inset-top,0px))]">{children}</div>
      <Footer />
    </div>
  );
}
