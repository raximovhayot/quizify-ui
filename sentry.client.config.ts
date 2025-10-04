/**
 * Sentry Client-Side Configuration
 *
 * Initializes Sentry for browser error tracking and performance monitoring.
 * Integrates with the security logger for comprehensive error tracking.
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
    // Sample rate: 0.0 to 1.0 (percentage of transactions to capture)
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Session Replay - captures user session for debugging
    // Only enable in production for selected sessions
    replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.1 : 0,

    // Capture 100% of sessions with errors
    replaysOnErrorSampleRate: 1.0,

    // Integration configuration
    integrations: [
      // Automatically capture breadcrumbs
      Sentry.breadcrumbsIntegration({
        console: true, // Log console.log/warn/error
        dom: true, // Log DOM clicks and inputs
        fetch: true, // Log fetch/XHR requests
        history: true, // Log navigation
      }),

      // Session replay for debugging
      Sentry.replayIntegration({
        maskAllText: true, // Mask all text content for privacy
        blockAllMedia: true, // Block images/videos for privacy
      }),

      // Automatically capture unhandled promise rejections
      Sentry.browserTracingIntegration(),
    ],

    // Before sending errors to Sentry
    beforeSend(event, hint) {
      // Filter out development errors in production
      if (ENVIRONMENT === 'production') {
        // Ignore localhost errors
        if (event.request?.url?.includes('localhost')) {
          return null;
        }

        // Ignore browser extension errors
        if (
          event.exception?.values?.[0]?.stacktrace?.frames?.some((frame) =>
            frame.filename?.includes('extension')
          )
        ) {
          return null;
        }
      }

      // Add custom context
      if (hint.originalException instanceof Error) {
        event.tags = {
          ...event.tags,
          error_type: hint.originalException.name,
        };
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extension errors
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',

      // Random plugins/extensions
      'Can\'t find variable: _AutofillCallbackHandler',

      // Network errors that are expected
      'NetworkError',
      'Failed to fetch',
      'Network request failed',

      // Hydration mismatches (handled by React)
      'Hydration failed',
      'There was an error while hydrating',

      // User aborted requests
      'AbortError',
      'The user aborted a request',
    ],

    // Denylist for URLs to ignore errors from
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,

      // Facebook flakiness
      /graph\.facebook\.com/i,

      // Google Analytics
      /google-analytics\.com/i,
      /googletagmanager\.com/i,
    ],

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION,

    // Debug mode (verbose logging)
    debug: ENVIRONMENT === 'development',

    // Send default PII (Personally Identifiable Information)
    // Set to false for privacy compliance
    sendDefaultPii: false,
  });

  // Set user context from session (call this after user logs in)
  // Example: Sentry.setUser({ id: userId, email: userEmail });

  console.log('✅ Sentry client-side error tracking initialized');
} else if (!SENTRY_DSN && ENVIRONMENT === 'production') {
  console.warn('⚠️ Sentry DSN not configured for production environment');
}
