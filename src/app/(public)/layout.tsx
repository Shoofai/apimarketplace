import { PublicNav } from '@/components/landing/PublicNav';
import Footer from '@/components/landing/Footer';
import { PrelaunchNav } from '@/components/prelaunch/PrelaunchNav';
import { PrelaunchFooter } from '@/components/prelaunch/PrelaunchFooter';
import { getSiteMode } from '@/lib/settings/site-mode';
import { getPlatformName } from '@/lib/settings/platform-name';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ mode }, platformName] = await Promise.all([
    getSiteMode(),
    getPlatformName(),
  ]);

  const isPrelaunch = mode === 'prelaunch' || mode === 'maintenance';

  return (
    <div className="min-h-screen flex flex-col">
      {isPrelaunch ? (
        <PrelaunchNav platformName={platformName} />
      ) : (
        <PublicNav />
      )}
      <div id="main-content" className="flex-1">{children}</div>
      {isPrelaunch ? (
        <PrelaunchFooter platformName={platformName} />
      ) : (
        <Footer />
      )}
    </div>
  );
}
