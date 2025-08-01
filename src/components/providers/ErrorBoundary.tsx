'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryTranslations {
  title: string;
  description: string;
  errorDetails: string;
  tryAgain: string;
  goHome: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  translations?: ErrorBoundaryTranslations;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default translations fallback
      const translations = this.props.translations || {
        title: 'Something went wrong',
        description: 'An unexpected error occurred. This has been logged and we\'ll look into it.',
        errorDetails: 'Error Details (Development)',
        tryAgain: 'Try Again',
        goHome: 'Go Home'
      };

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-destructive">
                {translations.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground">
                <p>{translations.description}</p>
                {typeof window !== 'undefined' && window.location.hostname === 'localhost' && this.state.error && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer font-medium">{translations.errorDetails}</summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" onClick={this.handleRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {translations.tryAgain}
                </Button>
                <Button onClick={this.handleGoHome}>
                  <Home className="mr-2 h-4 w-4" />
                  {translations.goHome}
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

// Wrapper component that provides translations to the ErrorBoundary class component
export function ErrorBoundaryWithTranslations({ children, fallback, onError }: Omit<ErrorBoundaryProps, 'translations'>) {
  const t = useTranslations('errorBoundary');
  
  const translations: ErrorBoundaryTranslations = {
    title: t('title'),
    description: t('description'),
    errorDetails: t('errorDetails'),
    tryAgain: t('tryAgain'),
    goHome: t('goHome')
  };

  return (
    <ErrorBoundary
      translations={translations}
      fallback={fallback}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    // In a real app, you might want to send this to an error reporting service
    console.error('Error caught by useErrorHandler:', error, errorInfo);
  };
}

// Export the wrapper as the default export for easier usage
export default ErrorBoundaryWithTranslations;