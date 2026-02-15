import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Space_Grotesk, Fira_Code } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { PlatformNameProvider } from '@/contexts/PlatformNameContext';
import { getPlatformName } from '@/lib/settings/platform-name';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const name = await getPlatformName();
  return {
    title: `${name} - The AI-Powered API Marketplace`,
    description:
      'Monetize APIs with zero friction. Discover APIs with AI-powered code generation. Govern at enterprise scale.',
    keywords:
      'API marketplace, API gateway, API monetization, AI code generation, API management',
    openGraph: {
      title: `${name} - The AI-Powered API Marketplace`,
      description: 'The only platform with AI, marketplace, gateway, and payments in one.',
      type: 'website',
      url: 'https://apimarketplace.pro',
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description: 'The AI-Powered API Marketplace That Runs Itself',
      images: ['/og-image.png'],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const platformName = await getPlatformName();
  return (
    <html lang="en" className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${firaCode.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <PlatformNameProvider name={platformName}>
            {children}
            <CookieConsentBanner />
          </PlatformNameProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
