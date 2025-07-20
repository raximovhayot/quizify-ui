'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. Please try again or contact support if the problem persists.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="rounded border p-2 text-xs">
                  <summary className="cursor-pointer font-medium">Error Details (Development)</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  };
}

// Async error boundary for handling async errors
export function AsyncErrorBoundary({ children, onError }: { children: ReactNode; onError?: (error: Error) => void }) {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(event.reason);
      setError(error);
      if (onError) {
        onError(error);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, [onError]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="font-medium text-destructive">Async Error</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          An error occurred while processing your request. Please try again.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setError(null)}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

// Fallback components for different scenarios
export function PageErrorFallback({ retry }: { retry?: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Page Error</h2>
        <p className="text-muted-foreground max-w-md">
          We couldn&apos;t load this page. Please check your connection and try again.
        </p>
      </div>
      {retry && (
        <Button onClick={retry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export function ComponentErrorFallback({ retry }: { retry?: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
        <Bug className="h-5 w-5 text-destructive" />
      </div>
      <h3 className="mb-2 font-medium">Component Error</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        This component failed to load properly.
      </p>
      {retry && (
        <Button variant="outline" size="sm" onClick={retry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

export function NetworkErrorFallback({ retry }: { retry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
      <div className="rounded-full bg-orange-100 p-3">
        <AlertTriangle className="h-8 w-8 text-orange-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Connection Error</h3>
        <p className="text-muted-foreground max-w-md">
          Unable to connect to the server. Please check your internet connection and try again.
        </p>
      </div>
      {retry && (
        <Button onClick={retry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Connection
        </Button>
      )}
    </div>
  );
}