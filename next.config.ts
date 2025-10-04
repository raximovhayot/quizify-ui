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
  // Security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Enable XSS protection in legacy browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Disable unnecessary browser features
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Enforce HTTPS in production
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              // Default source - only same origin
              "default-src 'self'",
              // Scripts - allow self, unsafe-eval for Next.js, unsafe-inline for inline scripts
              // Note: unsafe-inline and unsafe-eval should be removed in future iterations
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              // Styles - allow self, unsafe-inline for styled-jsx and Tailwind
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Images - allow self, data URIs, and HTTPS images
              "img-src 'self' blob: data: https:",
              // Fonts - allow self, data URIs, and Google Fonts
              "font-src 'self' data: https://fonts.gstatic.com",
              // Connect to API only
              `connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}`,
              // Prevent framing from other origins
              "frame-ancestors 'none'",
              // Base URI restriction
              "base-uri 'self'",
              // Form action restriction
              "form-action 'self'",
              // Upgrade insecure requests in production
              ...(process.env.NODE_ENV === 'production'
                ? ['upgrade-insecure-requests']
                : []),
            ]
              .join('; ')
              .replace(/\s+/g, ' ')
              .trim(),
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
