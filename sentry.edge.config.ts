/**
 * Sentry Edge Runtime Configuration
 *
 * Initializes Sentry for Edge Runtime (middleware).
 * Lightweight configuration for edge functions.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const ENABLE_SENTRY = process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true';

if (ENABLE_SENTRY && SENTRY_DSN) {
  Sentry.init({
    // Data Source Name
    dsn: SENTRY_DSN,

    // Environment
    environment: ENVIRONMENT,

    // Lower sample rate for edge runtime to minimize overhead
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.01 : 0.1,

    // Minimal integrations for edge runtime
    integrations: [],

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION,

    // Don't send PII
    sendDefaultPii: false,

    // Disable debug in edge runtime
    debug: false,
  });

  console.log('✅ Sentry edge runtime error tracking initialized');
}
