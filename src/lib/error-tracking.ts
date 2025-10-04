/**
 * Centralized Error Tracking Utility
 *
 * Provides a unified interface for error tracking across the application.
 * Integrates with Sentry and the security logger for comprehensive error monitoring.
 *
 * @fileoverview Error tracking and reporting utilities
 * @version 1.0.0
 */

import * as Sentry from '@sentry/nextjs';

import { logErrorBoundary } from './security-logger';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Error context interface
 */
export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  componentName?: string;
  actionName?: string;
  additionalData?: Record<string, unknown>;
  tags?: Record<string, string>;
}

/**
 * Check if Sentry is enabled
 */
export function isSentryEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true' &&
    !!process.env.NEXT_PUBLIC_SENTRY_DSN
  );
}

/**
 * Capture an exception with Sentry and security logger
 *
 * @param error - The error to capture
 * @param context - Additional context about the error
 * @param severity - Error severity level
 */
export function captureException(
  error: Error | unknown,
  context?: ErrorContext,
  severity: ErrorSeverity = ErrorSeverity.ERROR
): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Tracking]', error, context);
  }

  // Set Sentry context if enabled
  if (isSentryEnabled()) {
    // Set user context if provided
    if (context?.userId || context?.userEmail) {
      Sentry.setUser({
        id: context.userId,
        email: context.userEmail,
      });
    }

    // Set custom tags
    if (context?.tags) {
      Sentry.setTags(context.tags);
    }

    // Set additional context
    if (context?.additionalData) {
      Sentry.setContext('additional_data', context.additionalData);
    }

    // Set component context if provided
    if (context?.componentName) {
      Sentry.setTag('component', context.componentName);
    }

    // Set action context if provided
    if (context?.actionName) {
      Sentry.setTag('action', context.actionName);
    }

    // Capture the exception
    Sentry.captureException(error, {
      level: severity,
    });
  }

  // Also log to security logger for audit trail
  if (error instanceof Error) {
    const errorInfo: { componentStack: string } = {
      componentStack: context?.componentName || 'unknown',
    };
    logErrorBoundary(error, errorInfo as unknown as React.ErrorInfo);
  }
}

/**
 * Capture a message (non-exception event) with Sentry
 *
 * @param message - The message to capture
 * @param context - Additional context
 * @param severity - Message severity level
 */
export function captureMessage(
  message: string,
  context?: ErrorContext,
  severity: ErrorSeverity = ErrorSeverity.INFO
): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Error Tracking]', message, context);
  }

  if (isSentryEnabled()) {
    // Set context if provided
    if (context?.userId || context?.userEmail) {
      Sentry.setUser({
        id: context.userId,
        email: context.userEmail,
      });
    }

    if (context?.tags) {
      Sentry.setTags(context.tags);
    }

    if (context?.additionalData) {
      Sentry.setContext('additional_data', context.additionalData);
    }

    // Capture the message
    Sentry.captureMessage(message, severity);
  }
}

/**
 * Set user context for error tracking
 *
 * Call this after user logs in to associate errors with specific users
 *
 * @param userId - User ID
 * @param userEmail - User email (optional)
 * @param additionalData - Additional user data (optional)
 */
export function setUserContext(
  userId: string,
  userEmail?: string,
  additionalData?: Record<string, unknown>
): void {
  if (isSentryEnabled()) {
    Sentry.setUser({
      id: userId,
      email: userEmail,
      ...additionalData,
    });
  }
}

/**
 * Clear user context (call on logout)
 */
export function clearUserContext(): void {
  if (isSentryEnabled()) {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 *
 * Breadcrumbs are events that lead up to an error, helpful for debugging
 *
 * @param message - Breadcrumb message
 * @param category - Breadcrumb category (e.g., 'navigation', 'api', 'user-action')
 * @param data - Additional data
 * @param level - Severity level
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level: ErrorSeverity = ErrorSeverity.INFO
): void {
  if (isSentryEnabled()) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level,
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Breadcrumb: ${category}]`, message, data);
  }
}

/**
 * Start a new transaction for performance monitoring
 *
 * @param name - Transaction name
 * @param operation - Operation type (e.g., 'http.client', 'db.query')
 * @returns Transaction object or null if Sentry is disabled
 */
export function startTransaction(
  name: string,
  operation: string
): unknown | null {
  if (isSentryEnabled()) {
    // Note: Transaction API is deprecated in Sentry v8, use startSpan instead
    // For now, we return null as this is a compatibility layer
    // If needed, implement with Sentry.startSpan in the future
    return null;
  }
  return null;
}

/**
 * Create an error handler wrapper for async functions
 *
 * Wraps async functions to automatically catch and report errors
 *
 * @param fn - Async function to wrap
 * @param context - Error context
 * @returns Wrapped function
 */
export function withErrorTracking<T extends (...args: never[]) => Promise<unknown>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error, context);
      throw error;
    }
  }) as T;
}

/**
 * Show user feedback dialog (Sentry feature)
 *
 * Allows users to submit feedback when an error occurs
 *
 * @param eventId - Sentry event ID (optional)
 */
export function showUserFeedbackDialog(eventId?: string): void {
  if (isSentryEnabled()) {
    const id = eventId || Sentry.lastEventId();
    if (id) {
      Sentry.showReportDialog({
        eventId: id,
        title: 'It looks like we\'re having issues.',
        subtitle: 'Our team has been notified.',
        subtitle2: 'If you\'d like to help, tell us what happened below.',
        labelName: 'Name',
        labelEmail: 'Email',
        labelComments: 'What happened?',
        labelClose: 'Close',
        labelSubmit: 'Submit',
        errorGeneric:
          'An unknown error occurred while submitting your report. Please try again.',
        errorFormEntry: 'Some fields were invalid. Please correct the errors and try again.',
        successMessage: 'Your feedback has been sent. Thank you!',
      });
    }
  }
}

/**
 * Test error tracking integration
 *
 * Sends a test error to verify Sentry is working correctly
 * Only use in development/testing!
 */
export function testErrorTracking(): void {
  if (process.env.NODE_ENV === 'development') {
    captureMessage('Test error tracking integration', {
      tags: { test: 'true' },
      additionalData: { timestamp: new Date().toISOString() },
    });
    console.log('✅ Test message sent to error tracking service');
  } else {
    console.warn('⚠️ testErrorTracking() should only be used in development');
  }
}
