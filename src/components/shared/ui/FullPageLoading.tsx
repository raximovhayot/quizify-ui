import React from 'react';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export interface FullPageLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  minHeightClassName?: string;
}

/**
 * FullPageLoading
 *
 * A reusable, accessible full-page loading indicator that centers a spinner and optional text.
 * Use this component anywhere you need a full-screen or large-area loading state
 * (e.g., route guards, data fetching boundaries, Suspense fallbacks).
 */
export function FullPageLoading({
  text = 'Loading...',
  className,
  minHeightClassName = 'min-h-[40vh]',
  ...props
}: Readonly<FullPageLoadingProps>) {
  return (
    <div
      className={cn(minHeightClassName, 'flex items-center justify-center', className)}
      {...props}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
        <Spinner className="size-5" />
        <span>{text}</span>
      </div>
    </div>
  );
}

export default FullPageLoading;
