'use client';

import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorPageProps {
  errorCode?: number;
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export function ErrorPage({
  errorCode = 500,
  title,
  message,
  showBackButton = true,
  showHomeButton = true,
}: ErrorPageProps) {
  const t = useTranslations('errors');
  const router = useRouter();

  const getDefaultTitle = (code: number) => {
    switch (code) {
      case 403:
        return t('403.title', { default: 'Access Denied' });
      case 404:
        return t('404.title', { default: 'Page Not Found' });
      case 500:
        return t('500.title', { default: 'Internal Server Error' });
      default:
        return t('generic.title', { default: 'An Error Occurred' });
    }
  };

  const getDefaultMessage = (code: number) => {
    switch (code) {
      case 403:
        return t('403.message', {
          default: "You don't have permission to access this resource.",
        });
      case 404:
        return t('404.message', {
          default: 'The page you are looking for could not be found.',
        });
      case 500:
        return t('500.message', {
          default: 'Something went wrong on our end. Please try again later.',
        });
      default:
        return t('generic.message', {
          default: 'An unexpected error occurred. Please try again.',
        });
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {title || getDefaultTitle(errorCode)}
          </CardTitle>
          {errorCode && (
            <p className="text-sm text-muted-foreground">
              {t('errorCode', { default: 'Error Code' })}: {errorCode}
            </p>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {message || getDefaultMessage(errorCode)}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {showBackButton && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('actions.goBack', { default: 'Go Back' })}
              </Button>
            )}
            {showHomeButton && (
              <Button onClick={handleHome}>
                <Home className="mr-2 h-4 w-4" />
                {t('actions.goHome', { default: 'Go Home' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
