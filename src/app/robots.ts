import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://apimarketplace.pro';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/',
          '/start',
          '/portal/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
