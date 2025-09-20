import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';

interface ListSkeletonProps {
  count?: number;
}

export function ListSkeleton({ count = 3 }: ListSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-md border p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="mt-2 h-3 w-64" />
        </div>
      ))}
    </div>
  );
}

export default ListSkeleton;
