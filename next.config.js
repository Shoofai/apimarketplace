/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    // Enable Server Actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Don't bundle redis; use Node require at runtime (optional dependency)
  serverExternalPackages: ['redis'],

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Bundle analyzer (set ANALYZE=true to enable)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('redis');
    }
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
        })
      );
    }

    return config;
  },

  // Redirect old admin URLs to consolidated routes (bookmark compatibility)
  async redirects() {
    return [
      { source: '/dashboard/admin/users', destination: '/dashboard/admin/people/users', permanent: true },
      { source: '/dashboard/admin/users/:path*', destination: '/dashboard/admin/people/users/:path*', permanent: true },
      { source: '/dashboard/admin/organizations', destination: '/dashboard/admin/people/organizations', permanent: true },
      { source: '/dashboard/admin/verification', destination: '/dashboard/admin/people/verification', permanent: true },
      { source: '/dashboard/admin/tickets', destination: '/dashboard/admin/support/tickets', permanent: true },
      { source: '/dashboard/admin/tickets/:path*', destination: '/dashboard/admin/support/tickets/:path*', permanent: true },
      { source: '/dashboard/admin/moderation', destination: '/dashboard/admin/support/moderation', permanent: true },
      { source: '/dashboard/admin/platform-settings', destination: '/dashboard/admin/platform/settings', permanent: true },
      { source: '/dashboard/admin/feature-flags', destination: '/dashboard/admin/platform/feature-flags', permanent: true },
      { source: '/dashboard/admin/security', destination: '/dashboard/admin/operations/security', permanent: true },
      { source: '/dashboard/admin/performance', destination: '/dashboard/admin/operations/performance', permanent: true },
      { source: '/dashboard/admin/readiness', destination: '/dashboard/admin/operations/readiness', permanent: true },
      { source: '/dashboard/admin/health', destination: '/dashboard/admin/operations/health', permanent: true },
      { source: '/dashboard/admin/demo', destination: '/dashboard/admin/dev/demo', permanent: true },
      { source: '/dashboard/admin/tracker', destination: '/dashboard/admin/dev/tracker', permanent: true },
      // Panel menu four hubs: discover
      { source: '/dashboard/subscriptions', destination: '/dashboard/discover/subscriptions', permanent: true },
      { source: '/dashboard/favorites', destination: '/dashboard/discover/favorites', permanent: true },
      { source: '/dashboard/collections', destination: '/dashboard/discover/collections', permanent: true },
      { source: '/dashboard/collections/:path*', destination: '/dashboard/discover/collections/:path*', permanent: true },
      { source: '/dashboard/challenges', destination: '/dashboard/discover/challenges', permanent: true },
      { source: '/dashboard/challenges/:path*', destination: '/dashboard/discover/challenges/:path*', permanent: true },
      { source: '/dashboard/forum', destination: '/dashboard/discover/forum', permanent: true },
      { source: '/dashboard/forum/:path*', destination: '/dashboard/discover/forum/:path*', permanent: true },
      { source: '/dashboard/referrals', destination: '/dashboard/discover/referrals', permanent: true },
      // analytics
      { source: '/dashboard/cost-intelligence', destination: '/dashboard/analytics/cost-intelligence', permanent: true },
      { source: '/dashboard/provider/analytics', destination: '/dashboard/analytics/provider', permanent: true },
      // provider apis
      { source: '/dashboard/apis', destination: '/dashboard/provider/apis', permanent: true },
      { source: '/dashboard/apis/:path*', destination: '/dashboard/provider/apis/:path*', permanent: true },
      // developer
      { source: '/dashboard/api-builder', destination: '/dashboard/developer/api-builder', permanent: true },
      { source: '/dashboard/sandbox', destination: '/dashboard/developer/sandbox', permanent: true },
      { source: '/dashboard/playground', destination: '/dashboard/developer/playground', permanent: true },
      { source: '/dashboard/collab', destination: '/dashboard/developer/collab', permanent: true },
      { source: '/dashboard/workflows', destination: '/dashboard/developer/workflows', permanent: true },
    ];
  },

  // Code splitting (disabled to avoid Next 15.5 "Cannot find module for page" during Collecting page data)
  // modularizeImports: {
  //   'lucide-react': {
  //     transform: 'lucide-react/dist/esm/icons/{{member}}',
  //   },
  // },
};

module.exports = nextConfig;
