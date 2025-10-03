/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */
'use client';

import { AlertTriangle, Bug, Home, RefreshCw } from 'lucide-react';

import React, { Component, ErrorInfo, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Enhanced Error Boundary with comprehensive error handling
 *
 * Provides feature-specific error boundaries with error reporting, logging,
 * and user-friendly fallback components for better error handling throughout
 * the application.
 *
 * @fileoverview Enhanced error boundary components and utilities
 * @version 1.0.0
 * @since 2025-01-01
 */

// =============================================================================
// ERROR TYPES AND INTERFACES
// =============================================================================

/**
 * Error severity levels for categorizing different types of errors
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error context information for better debugging and reporting
 */
export interface ErrorContext {
  /** Component name where the error occurred */
  componentName?: string;
  /** Feature area (auth, profile, quiz, etc.) */
  feature?: string;
  /** User ID if available */
  userId?: string;
  /** Current route/page */
  route?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Whether error should be reported to external services */
  reportable?: boolean;
}

/**
 * Error boundary state interface
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

/**
 * Error boundary props interface
 */
interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Custom fallback component */
  fallback?: React.ComponentType<ErrorFallbackProps>;
  /** Error context information */
  context?: ErrorContext;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Whether to show detailed error information in development */
  showDetails?: boolean;
  /** Custom error handler */
  onError?: (
    error: Error,
    errorInfo: ErrorInfo,
    context?: ErrorContext
  ) => void;
  /** Whether to enable automatic retry */
  enableRetry?: boolean;
}

/**
 * Error fallback component props
 */
export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  context?: ErrorContext;
  retry: () => void;
  canRetry: boolean;
  retryCount: number;
}

// =============================================================================
// ERROR REPORTING AND LOGGING
// =============================================================================

/**
 * Error reporting services for logging and external reporting
 */
class ErrorReportingService {
  private static instance: ErrorReportingService;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment =
      typeof window !== 'undefined' && window.location.hostname === 'localhost';
  }

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  /**
   * Log error to console with structured information
   */
  logError(error: Error, errorInfo: ErrorInfo, context?: ErrorContext): string {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();

    const errorReport = {
      errorId,
      timestamp,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context,
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    if (this.isDevelopment) {
      console.group(`🚨 Error Report [${errorId}]`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Context:', context);
      console.error('Full Report:', errorReport);
      console.groupEnd();
    } else {
      console.error(`Error [${errorId}]:`, error.message);
    }

    return errorId;
  }

  /**
   * Report error to external services (placeholder for actual implementation)
   */
  async reportError(
    error: Error,
    errorInfo: ErrorInfo,
    context?: ErrorContext
  ): Promise<void> {
    if (!context?.reportable) return;

    try {
      // In a real implementation, this would send to an error reporting services
      // like Sentry, LogRocket, or a custom endpoint
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        context,
        timestamp: new Date().toISOString(),
      };

      if (this.isDevelopment) {
        console.log('Would report error to external services:', errorReport);
      } else {
        // Example: await fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorReport) });
        console.warn('Error reporting not configured for production');
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  /**
   * Generate unique error ID for tracking
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// =============================================================================
// ERROR FALLBACK COMPONENTS
// =============================================================================

/**
 * Default error fallback component with retry functionality
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  context,
  retry,
  canRetry,
  retryCount,
}) => {
  const isDevelopment =
    typeof window !== 'undefined' && window.location.hostname === 'localhost';

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <CardTitle className="text-red-900">Something went wrong</CardTitle>
        <CardDescription>
          {context?.feature
            ? `An error occurred in the ${context.feature} feature.`
            : 'An unexpected error occurred.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDevelopment && (
          <div className="p-3 bg-gray-100 rounded-md">
            <p className="text-sm font-medium text-gray-900 mb-1">
              Error Details:
            </p>
            <p className="text-xs text-gray-600 font-mono">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          {canRetry && (
            <Button
              onClick={retry}
              variant="default"
              className="flex-1"
              disabled={retryCount >= 3}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryCount > 0 ? `Retry (${retryCount}/3)` : 'Try Again'}
            </Button>
          )}

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </Button>

          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>

        {isDevelopment && (
          <Button
            onClick={() => {
              console.error('Error details:', { error, context });
              alert('Error details logged to console');
            }}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <Bug className="w-4 h-4 mr-2" />
            Debug Info
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Minimal error fallback for inline components
 */
export const MinimalErrorFallback: React.FC<ErrorFallbackProps> = ({
  error: _error,
  retry,
  canRetry,
}) => (
  <div className="p-4 border border-red-200 rounded-md bg-red-50">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
        <span className="text-sm text-red-700">Error loading content</span>
      </div>
      {canRetry && (
        <Button onClick={retry} size="sm" variant="outline">
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  </div>
);

// =============================================================================
// ENHANCED ERROR BOUNDARY COMPONENT
// =============================================================================

/**
 * Enhanced Error Boundary with comprehensive error handling
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private errorReportingService: ErrorReportingService;
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    };

    this.errorReportingService = ErrorReportingService.getInstance();
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { context, onError } = this.props;

    // Log and report error
    const errorId = this.errorReportingService.logError(
      error,
      errorInfo,
      context
    );
    this.errorReportingService.reportError(error, errorInfo, context);

    // Update state with error information
    this.setState({
      errorInfo,
      errorId,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo, context);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  /**
   * Retry mechanism with exponential backoff
   */
  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      return;
    }

    // Clear error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: retryCount + 1,
    });

    // If error occurs again quickly, add a delay before next retry
    if (retryCount > 0) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
      this.retryTimeoutId = setTimeout(() => {
        // Force re-render after delay
        this.forceUpdate();
      }, delay);
    }
  };

  render() {
    const {
      children,
      fallback: CustomFallback,
      context,
      maxRetries = 3,
      enableRetry = true,
    } = this.props;

    const { hasError, error, errorInfo, retryCount } = this.state;

    if (hasError && error && errorInfo) {
      const FallbackComponent = CustomFallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          context={context}
          retry={this.handleRetry}
          canRetry={enableRetry && retryCount < maxRetries}
          retryCount={retryCount}
        />
      );
    }

    return children;
  }
}

// =============================================================================
// FEATURE-SPECIFIC ERROR BOUNDARIES
// =============================================================================

/**
 * Authentication feature error boundary
 */
export const AuthErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    context={{
      feature: 'authentication',
      severity: 'high',
      reportable: true,
    }}
    maxRetries={2}
  >
    {children}
  </ErrorBoundary>
);

/**
 * Profile feature error boundary
 */
export const ProfileErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    context={{
      feature: 'profile',
      severity: 'medium',
      reportable: true,
    }}
    fallback={MinimalErrorFallback}
  >
    {children}
  </ErrorBoundary>
);

/**
 * Quiz feature error boundary
 */
export const QuizErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    context={{
      feature: 'quiz',
      severity: 'high',
      reportable: true,
    }}
    maxRetries={1}
  >
    {children}
  </ErrorBoundary>
);

/**
 * Form error boundary for form-specific errors
 */
export const FormErrorBoundary: React.FC<{
  children: ReactNode;
  formName?: string;
}> = ({ children, formName }) => (
  <ErrorBoundary
    context={{
      feature: 'form',
      componentName: formName,
      severity: 'medium',
      reportable: false,
    }}
    fallback={MinimalErrorFallback}
    maxRetries={2}
  >
    {children}
  </ErrorBoundary>
);

// =============================================================================
// ERROR BOUNDARY HOOKS AND UTILITIES
// =============================================================================

/**
 * Hook to manually trigger error boundary
 */
export const useErrorHandler = () => {
  return (error: Error, context?: ErrorContext) => {
    const errorReportingService = ErrorReportingService.getInstance();

    // Create mock error info for manual errors
    const errorInfo: ErrorInfo = {
      componentStack: 'Manual error trigger',
    };

    errorReportingService.logError(error, errorInfo, context);
    errorReportingService.reportError(error, errorInfo, context);

    // Re-throw to trigger error boundary
    throw error;
  };
};

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
