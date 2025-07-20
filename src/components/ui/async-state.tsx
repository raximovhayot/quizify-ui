'use client';

import React from 'react';
import { LoadingSpinner, InlineLoading } from '@/components/ui/loading-spinner';
import { 
  Skeleton, 
  CardSkeleton, 
  TableSkeleton, 
  ListSkeleton, 
  FormSkeleton, 
  ChartSkeleton,
  PageSkeleton 
} from '@/components/ui/skeleton';
import { 
  ErrorBoundary, 
  PageErrorFallback, 
  ComponentErrorFallback, 
  NetworkErrorFallback 
} from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

/**
 * Types for async state management
 */
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isRefreshing?: boolean;
}

export interface AsyncStateProps<T> {
  state: AsyncState<T>;
  onRetry?: () => void;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}

/**
 * Generic async state wrapper component
 */
export function AsyncStateWrapper<T>({
  state,
  onRetry,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
}: AsyncStateProps<T>) {
  // Loading state
  if (state.isLoading && !state.data) {
    return <>{loadingComponent || <InlineLoading text="Loading..." />}</>;
  }

  // Error state
  if (state.error && !state.data) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground mb-4">{state.error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (!state.data) {
    return <>{emptyComponent || <div className="text-center py-8 text-muted-foreground">No data available</div>}</>;
  }

  // Success state with optional refreshing indicator
  return (
    <div className="relative">
      {state.isRefreshing && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2">
            <LoadingSpinner size="sm" />
          </div>
        </div>
      )}
      {children(state.data)}
    </div>
  );
}

/**
 * Page-level async state wrapper
 */
export function AsyncPage<T>({
  state,
  onRetry,
  title,
  description,
  children,
}: AsyncStateProps<T> & {
  title?: string;
  description?: string;
}) {
  return (
    <ErrorBoundary fallback={<PageErrorFallback retry={onRetry} />}>
      <AsyncStateWrapper
        state={state}
        onRetry={onRetry}
        loadingComponent={<PageSkeleton />}
        errorComponent={<PageErrorFallback retry={onRetry} />}
        emptyComponent={
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="space-y-4">
              {title && <h2 className="text-2xl font-semibold">{title}</h2>}
              {description && <p className="text-muted-foreground">{description}</p>}
              <p className="text-muted-foreground">No data available</p>
              {onRetry && (
                <Button onClick={onRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        }
      >
        {children}
      </AsyncStateWrapper>
    </ErrorBoundary>
  );
}

/**
 * Table async state wrapper
 */
export function AsyncTable<T>({
  state,
  onRetry,
  columns = 4,
  rows = 5,
  children,
}: AsyncStateProps<T> & {
  columns?: number;
  rows?: number;
}) {
  return (
    <AsyncStateWrapper
      state={state}
      onRetry={onRetry}
      loadingComponent={<TableSkeleton rows={rows} columns={columns} />}
      errorComponent={<ComponentErrorFallback retry={onRetry} />}
      emptyComponent={
        <div className="text-center py-8">
          <p className="text-muted-foreground">No items found</p>
          {onRetry && (
            <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      }
    >
      {children}
    </AsyncStateWrapper>
  );
}

/**
 * List async state wrapper
 */
export function AsyncList<T>({
  state,
  onRetry,
  items = 3,
  children,
}: AsyncStateProps<T> & {
  items?: number;
}) {
  return (
    <AsyncStateWrapper
      state={state}
      onRetry={onRetry}
      loadingComponent={<ListSkeleton items={items} />}
      errorComponent={<ComponentErrorFallback retry={onRetry} />}
      emptyComponent={
        <div className="text-center py-8">
          <p className="text-muted-foreground">No items found</p>
          {onRetry && (
            <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      }
    >
      {children}
    </AsyncStateWrapper>
  );
}

/**
 * Form async state wrapper
 */
export function AsyncForm<T>({
  state,
  onRetry,
  children,
}: AsyncStateProps<T>) {
  return (
    <AsyncStateWrapper
      state={state}
      onRetry={onRetry}
      loadingComponent={<FormSkeleton />}
      errorComponent={<ComponentErrorFallback retry={onRetry} />}
    >
      {children}
    </AsyncStateWrapper>
  );
}

/**
 * Chart async state wrapper
 */
export function AsyncChart<T>({
  state,
  onRetry,
  children,
}: AsyncStateProps<T>) {
  return (
    <AsyncStateWrapper
      state={state}
      onRetry={onRetry}
      loadingComponent={<ChartSkeleton />}
      errorComponent={<ComponentErrorFallback retry={onRetry} />}
      emptyComponent={
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No data to display</p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            )}
          </div>
        </div>
      }
    >
      {children}
    </AsyncStateWrapper>
  );
}

/**
 * Network status indicator
 */
export function NetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">No internet connection</span>
      </div>
    </div>
  );
}

/**
 * Connection status wrapper
 */
export function ConnectionAware({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <NetworkErrorFallback />;
  }

  return <>{children}</>;
}

/**
 * Hook for managing async state
 */
export function useAsyncState<T>(initialData: T | null = null): [
  AsyncState<T>,
  {
    setData: (data: T | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setRefreshing: (refreshing: boolean) => void;
    reset: () => void;
  }
] {
  const [state, setState] = React.useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
    isRefreshing: false,
  });

  const setData = React.useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data, error: null }));
  }, []);

  const setLoading = React.useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = React.useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const setRefreshing = React.useCallback((isRefreshing: boolean) => {
    setState(prev => ({ ...prev, isRefreshing }));
  }, []);

  const reset = React.useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
      isRefreshing: false,
    });
  }, [initialData]);

  return [
    state,
    {
      setData,
      setLoading,
      setError,
      setRefreshing,
      reset,
    },
  ];
}