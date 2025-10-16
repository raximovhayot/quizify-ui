import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface IListRowsSkeletonProps {
  /** Number of skeleton rows to render */
  rows?: number;
  /** @deprecated use `rows` */
  count?: number;
  /** Use tighter vertical spacing */
  dense?: boolean;
  /** Show a right-side action skeleton (e.g., button) */
  showAction?: boolean;
  className?: string;
}

/**
 * ListRowsSkeleton
 *
 * A small helper built from shadcn/ui primitives to render a vertical list of
 * skeleton rows that roughly match a list item. This replaces the legacy
 * atomic `ListSkeleton` while keeping the same defaults and visual appearance.
 */
export function ListRowsSkeleton({
  rows,
  count,
  dense = false,
  showAction = true,
  className = '',
}: Readonly<IListRowsSkeletonProps>) {
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

export default ListRowsSkeleton;
