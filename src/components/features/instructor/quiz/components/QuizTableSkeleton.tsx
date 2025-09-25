'use client';

import { memo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface QuizTableSkeletonProps {
  rows?: number;
  className?: string;
}

function QuizTableSkeletonComponent({
  rows = 5,
  className,
}: Readonly<QuizTableSkeletonProps>) {
  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-9 w-[140px]" />
          </div>
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50px]">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead className="w-[300px]">
                <Skeleton className="h-4 w-[60px]" />
              </TableHead>
              <TableHead className="w-[120px]">
                <Skeleton className="h-4 w-[50px]" />
              </TableHead>
              <TableHead className="w-[100px]">
                <Skeleton className="h-4 w-[70px]" />
              </TableHead>
              <TableHead className="w-[120px]">
                <Skeleton className="h-4 w-[60px]" />
              </TableHead>
              <TableHead className="w-[100px]">
                <Skeleton className="h-4 w-[40px]" />
              </TableHead>
              <TableHead className="w-[100px]">
                <Skeleton className="h-4 w-[60px]" />
              </TableHead>
              <TableHead className="w-[80px]">
                <Skeleton className="h-4 w-[50px]" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                {/* Checkbox */}
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>

                {/* Title */}
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-[60px]" />
                      <Skeleton className="h-5 w-[60px]" />
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Skeleton className="h-6 w-[70px] rounded-full" />
                </TableCell>

                {/* Questions */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-[20px]" />
                  </div>
                </TableCell>

                {/* Created */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-[80px]" />
                  </div>
                </TableCell>

                {/* Time */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-[40px]" />
                  </div>
                </TableCell>

                {/* Attempts */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-[30px]" />
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export const QuizTableSkeleton = memo(QuizTableSkeletonComponent);
