'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface AssignmentsTableSkeletonProps {
  count?: number;
  className?: string;
}

export function AssignmentsTableSkeleton({
  count = 10,
  className,
}: AssignmentsTableSkeletonProps) {
  return (
    <div
      className={`space-y-4 ${className || ''}`}
      role="status"
      aria-busy="true"
    >
      {/* Results count skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead className="w-[15%]">
                <Skeleton className="h-4 w-12" />
              </TableHead>
              <TableHead className="w-[15%]">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead className="w-[15%]">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead className="w-[15%] text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: count }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
