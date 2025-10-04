/**
 * Sentry Server-Side Configuration
 *
 * Initializes Sentry for server-side error tracking.
 * Captures errors in API routes, server components, and middleware.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const ENABLE_SENTRY = process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true';

if (ENABLE_SENTRY && SENTRY_DSN) {
  Sentry.init({
    // Data Source Name - unique identifier for your Sentry project
    dsn: SENTRY_DSN,

    // Environment (development, staging, production)
    environment: ENVIRONMENT,

    // Enable tracing for performance monitoring
    // Lower sample rate on server to reduce overhead
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.05 : 1.0,

    // Server-specific integrations
    integrations: [
      // Capture breadcrumbs for server operations
      Sentry.breadcrumbsIntegration({
        console: true,
      }),
    ],

    // Before sending errors to Sentry
    beforeSend(event) {
      // Filter out expected errors in production
      if (ENVIRONMENT === 'production') {
        // Ignore Next.js 404 errors
        if (event.message?.includes('404')) {
          return null;
        }
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Expected Next.js errors
      'NEXT_NOT_FOUND',
      'NEXT_REDIRECT',

      // Network errors that are expected
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
    ],

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION,

    // Debug mode (verbose logging)
    debug: ENVIRONMENT === 'development',

    // Don't send PII by default
    sendDefaultPii: false,
  });

  console.log('✅ Sentry server-side error tracking initialized');
} else if (!SENTRY_DSN && ENVIRONMENT === 'production') {
  console.warn('⚠️ Sentry DSN not configured for production environment');
}
