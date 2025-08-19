import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Validate environment variables
import './src/env.mjs';

const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts');

// Bundle analyzer
const withBundleAnalyzer = (config: NextConfig): NextConfig => {
  if (process.env.ANALYZE === 'true') {
    try {
      const bundleAnalyzer = require('@next/bundle-analyzer')({
        enabled: true,
      });
      return bundleAnalyzer(config);
    } catch {
      console.warn('Bundle analyzer not installed, skipping analysis');
      return config;
    }
  }
  return config;
};

const nextConfig: NextConfig = {
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  // Optimize bundle splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            // Vendor chunk for external libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Common components chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
            // UI components chunk
            ui: {
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              name: 'ui-components',
              chunks: 'all',
              priority: 8,
            },
          },
        },
      };
    }
    return config;
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
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Power optimizations
  poweredByHeader: false,
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
