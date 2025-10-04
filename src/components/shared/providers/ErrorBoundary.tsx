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

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

import React, { Component, ErrorInfo, ReactNode } from 'react';

import { useTranslations } from 'next-intl';

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
  /** Legacy flag retained for backward compatibility.
   *  No external reporting occurs; may be used internally for categorization only. */
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
  maxRetries?: number;
}

// =============================================================================
// ERROR REPORTING AND LOGGING
// =============================================================================

/**
 * Error reporting services for logging and external reporting
 */

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
  maxRetries,
}) => {
  const t = useTranslations();
  const effectiveMax = typeof maxRetries === 'number' ? maxRetries : 3;
  const isDevelopment =
    typeof window !== 'undefined' && window.location.hostname === 'localhost';

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <CardTitle className="text-red-900">{t('errors.title')}</CardTitle>
        <CardDescription>
          {context?.feature
            ? t('errors.description.feature', { feature: context.feature })
            : t('errors.description.default')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDevelopment && (
          <div className="p-3 bg-gray-100 rounded-md">
            <p className="text-sm font-medium text-gray-900 mb-1">
              {t('errors.details.label')}
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
              disabled={retryCount >= effectiveMax}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryCount > 0
                ? t('errors.actions.retryCount', {
                    count: retryCount,
                    max: effectiveMax,
                  })
                : t('errors.actions.retry')}
            </Button>
          )}

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('errors.actions.reload')}
          </Button>

          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            {t('errors.actions.home')}
          </Button>
        </div>
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
}) => {
  const t = useTranslations();
  return (
    <div className="p-4 border border-red-200 rounded-md bg-red-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
          <span className="text-sm text-red-700">
            {t('errors.inline.title')}
          </span>
        </div>
        {canRetry && (
          <Button onClick={retry} size="sm" variant="outline">
            <RefreshCw className="w-3 h-3 mr-1" />
            {t('errors.actions.retry')}
          </Button>
        )}
      </div>
    </div>
  );
};

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
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { context, onError } = this.props;

    // Monitoring removed: no logging/reporting
    const errorId: string | null = null;

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
          maxRetries={maxRetries}
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
  return (_error: Error, _context?: ErrorContext) => {
    // Monitoring removed: simply re-throw to trigger the nearest ErrorBoundary
    throw _error;
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
