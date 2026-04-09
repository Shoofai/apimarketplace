import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, Fira_Code } from 'next/font/google';
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

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const name = await getPlatformName();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://apimarketplace.pro';
  return {
    metadataBase: new URL(baseUrl),
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
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${name} — The AI-Powered API Marketplace` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description: 'The AI-Powered API Marketplace That Runs Itself',
      images: ['/opengraph-image'],
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/icon', sizes: '32x32', type: 'image/png' },
      ],
      apple: { url: '/icon', sizes: '180x180', type: 'image/png' },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const platformName = await getPlatformName();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;

  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} ${firaCode.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {supabaseHost && <link rel="preconnect" href={`https://${supabaseHost}`} />}
        <link rel="preconnect" href="https://js.stripe.com" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-primary focus:outline-none"
        >
          Skip to content
        </a>
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
