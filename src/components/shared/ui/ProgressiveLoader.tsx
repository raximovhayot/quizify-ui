'use client';

import { ReactNode, useEffect, useState } from 'react';

import { LoadingSpinner } from './LoadingSpinner';

export interface ProgressiveLoaderProps {
  isLoading: boolean;
  isRefreshing?: boolean;
  isLoadingMore?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  refreshIndicator?: ReactNode;
  loadMoreIndicator?: ReactNode;
  delay?: number; // Delay before showing loading state
  className?: string;
}

export function ProgressiveLoader({
  isLoading,
  isRefreshing = false,
  isLoadingMore = false,
  children,
  fallback,
  refreshIndicator,
  loadMoreIndicator,
  delay = 200,
  className,
}: ProgressiveLoaderProps) {
  const [showLoading, setShowLoading] = useState(false);

  // Delay showing loading state to prevent flicker on fast requests
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoading(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isLoading, delay]);

  // Initial loading state
  if (isLoading && showLoading) {
    return (
      <div className={className}>
        {fallback || (
          <div className="flex items-center justify-center min-h-[200px]">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Refreshing indicator */}
      {isRefreshing && (
        <div className="mb-4">
          {refreshIndicator || (
            <div className="flex items-center justify-center p-2">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-muted-foreground">
                Refreshing...
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div className={isRefreshing ? 'opacity-75' : ''}>{children}</div>

      {/* Load more indicator */}
      {isLoadingMore && (
        <div className="mt-4">
          {loadMoreIndicator || (
            <div className="flex items-center justify-center p-4">
              <LoadingSpinner size="md" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading more...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
