'use client';

import React from 'react';

import { AppPagination } from '@/components/shared/ui/AppPagination';

import { AssignmentDTO } from '../types/assignment';
import { AssignmentsTable } from './AssignmentsTable';
import { AssignmentsTableSkeleton } from './AssignmentsTableSkeleton';

interface AnalyticsListSectionProps {
  loading: boolean;
  assignments: AssignmentDTO[] | undefined;
  totalElements?: number;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AnalyticsListSection({
  loading,
  assignments,
  totalElements,
  searchQuery,
  currentPage,
  totalPages,
  onPageChange,
}: Readonly<AnalyticsListSectionProps>) {
  if (loading) {
    return <AssignmentsTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <AssignmentsTable
        assignments={assignments || []}
        totalElements={totalElements}
        searchQuery={searchQuery}
      />

      <AppPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default AnalyticsListSection;
