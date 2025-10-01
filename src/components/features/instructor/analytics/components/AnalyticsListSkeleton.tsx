'use client';

import { SkeletonCard } from '@/components/shared/ui/SkeletonCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface AnalyticsListSkeletonProps {
  count?: number;
  className?: string;
}

export function AnalyticsListSkeleton({
  count = 6,
  className,
}: AnalyticsListSkeletonProps) {
  return (
    <div
      className={`space-y-6 ${className || ''}`}
      role="status"
      aria-busy="true"
    >
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16 mt-2" />
            <Skeleton className="h-3 w-20 mt-2" />
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-9 flex-1" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[160px]" />
          </div>
        </div>
      </Card>

      {/* Results Summary and Page Size */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-9 w-[100px]" />
      </div>

      {/* List */}
      <div className="grid gap-3">
        {Array.from({ length: count }).map((_, idx) => (
          <SkeletonCard key={idx} variant="detailed" />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  );
}
