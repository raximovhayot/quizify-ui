import { useCallback, useRef, useState } from 'react';

import { analytics } from '@/lib/analytics';

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

export function useErrorRecovery<T extends unknown[], R>(
  asyncFunction: (...args: T) => Promise<R>,
  options: ErrorRecoveryOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const execute = useCallback(
    async (...args: T): Promise<R> => {
      try {
        const result = await asyncFunction(...args);
        // Reset retry count on success
        setRetryCount(0);
        setLastError(null);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setLastError(err);

        // Track error
        analytics.error(err, {
          retryCount,
          maxRetries,
          operation: asyncFunction.name || 'anonymous',
        });

        onError?.(err);

        // Check if we should retry
        if (retryCount < maxRetries) {
          setIsRetrying(true);
          setRetryCount((prev) => prev + 1);

          onRetry?.(retryCount + 1);

          // Wait before retrying
          await new Promise((resolve) => {
            retryTimeoutRef.current = setTimeout(
              resolve,
              retryDelay * Math.pow(2, retryCount)
            );
          });

          setIsRetrying(false);

          // Retry recursively
          return execute(...args);
        } else {
          // Max retries reached
          onMaxRetriesReached?.(err);
          throw err;
        }
      }
    },
    [
      asyncFunction,
      maxRetries,
      retryDelay,
      retryCount,
      onError,
      onRetry,
      onMaxRetriesReached,
    ]
  );

  const reset = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    setIsRetrying(false);
    setRetryCount(0);
    setLastError(null);
  }, []);

  return {
    execute,
    reset,
    isRetrying,
    retryCount,
    lastError,
    canRetry: retryCount < maxRetries,
  };
}

/**
 * Hook for handling async operations with built-in error recovery
 */
export function useAsyncWithRecovery<T extends unknown[], R>(
  asyncFunction: (...args: T) => Promise<R>,
  options: ErrorRecoveryOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<R | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const errorRecovery = useErrorRecovery(asyncFunction, {
    ...options,
    onError: (err) => {
      setError(err);
      options.onError?.(err);
    },
  });

  const execute = useCallback(
    async (...args: T) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await errorRecovery.execute(...args);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [errorRecovery]
  );

  const retry = useCallback(
    async (...args: T) => {
      if (errorRecovery.canRetry) {
        return execute(...args);
      }
      throw new Error('Maximum retries reached');
    },
    [execute, errorRecovery.canRetry]
  );

  const reset = useCallback(() => {
    errorRecovery.reset();
    setIsLoading(false);
    setData(null);
    setError(null);
  }, [errorRecovery]);

  return {
    execute,
    retry,
    reset,
    isLoading,
    data,
    error,
    isRetrying: errorRecovery.isRetrying,
    retryCount: errorRecovery.retryCount,
    canRetry: errorRecovery.canRetry,
  };
}

/**
 * Hook for handling network requests with automatic retry logic
 */
export function useNetworkRequest<T>(
  url: string,
  options: RequestInit & ErrorRecoveryOptions = {}
) {
  const {
    maxRetries,
    retryDelay,
    onError,
    onRetry,
    onMaxRetriesReached,
    ...fetchOptions
  } = options;

  const requestFunction = useCallback(async (): Promise<T> => {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, [url, fetchOptions]);

  return useAsyncWithRecovery(requestFunction, {
    maxRetries,
    retryDelay,
    onError,
    onRetry,
    onMaxRetriesReached,
  });
}
