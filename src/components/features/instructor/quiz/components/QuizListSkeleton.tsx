'use client';

import { SkeletonCard } from '@/components/shared/ui/SkeletonCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface QuizListSkeletonProps {
  count?: number;
  className?: string;
}

export function QuizListSkeleton({
  count = 6,
  className,
}: QuizListSkeletonProps) {
  return (
    <div
      className={`space-y-6 ${className || ''}`}
      role="status"
      aria-busy="true"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
          <Skeleton className="h-4 w-64 sm:w-80" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-9 flex-1" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[140px]" />
          </div>
        </div>
      </Card>

      {/* Results Summary and Page Size */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-9 w-[100px]" />
      </div>

      {/* List */}
      <div className="grid gap-4">
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
