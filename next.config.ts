import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Validate environment variables
import './src/env.mjs';

const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts');

const nextConfig: NextConfig = {
  experimental: {
    // Enable experimental features if needed for NextAuth v5
  },
  // Ensure NextAuth routes are handled properly
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
