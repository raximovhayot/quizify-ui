import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface ListSkeletonProps {
  /** Prefer `rows`; `count` is kept for backward compatibility. */
  rows?: number;
  /** @deprecated use `rows` */
  count?: number;
  dense?: boolean;
  /** Show a right-side action skeleton (e.g., button) */
  showAction?: boolean;
  className?: string;
}

/**
 * Molecule: ListSkeleton
 * Presents a vertical list of skeleton rows that roughly match `ListItem` shape.
 */
export function ListSkeleton({ rows, count, dense = false, showAction = true, className = '' }: Readonly<ListSkeletonProps>) {
  const n = typeof rows === 'number' ? rows : typeof count === 'number' ? count : 3;
  const spacing = dense ? 'space-y-1' : 'space-y-2';
  return (
    <div className={[spacing, className].filter(Boolean).join(' ')}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="rounded-md border p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            {showAction && <Skeleton className="h-6 w-16" />}
          </div>
          <Skeleton className="mt-2 h-3 w-64" />
        </div>
      ))}
    </div>
  );
}

export default ListSkeleton;
