'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ErrorDisplayProps {
  error: Error | unknown;
  onRetry?: () => void;
  title?: string;
  description?: string;
  showRetry?: boolean;
  className?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  title,
  description,
  showRetry = true,
  className,
}: ErrorDisplayProps) {
  const t = useTranslations();

  const getErrorMessage = (error: Error | unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return t('common.error.unknown', { fallback: 'An unknown error occurred' });
  };

  const defaultTitle =
    title || t('common.error.title', { fallback: 'Something went wrong' });
  const defaultDescription =
    description ||
    t('common.error.description', {
      fallback: 'There was a problem loading the data. Please try again.',
    });

  return (
    <div
      className={`flex items-center justify-center min-h-[200px] ${className || ''}`}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-lg">{defaultTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {defaultDescription}
          </p>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {getErrorMessage(error)}
            </AlertDescription>
          </Alert>

          {showRetry && onRetry && (
            <div className="flex justify-center">
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('common.retry', { fallback: 'Try Again' })}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
