'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

// Card skeleton for dashboard cards
export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-[60px]" />
        <Skeleton className="h-3 w-[120px]" />
      </div>
    </div>
  );
}

// Table skeleton for data tables
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// List skeleton for lists
export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Form skeleton for forms
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-10 w-[100px]" />
    </div>
  );
}

// Chart skeleton for analytics
export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
      <div className="h-[300px] w-full">
        <div className="flex h-full items-end justify-between space-x-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Page skeleton for full page loading
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      
      {/* Content area */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-6 w-[150px]" />
          <ChartSkeleton />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-[150px]" />
          <ListSkeleton items={5} />
        </div>
      </div>
    </div>
  );
}