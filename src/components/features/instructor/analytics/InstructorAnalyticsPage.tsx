'use client';

import { useCallback } from 'react';

import { useUrlFilter } from '@/components/shared/hooks/useUrlFilter';
import { ErrorDisplay } from '@/components/shared/ui/ErrorDisplay';

import { AnalyticsContent } from './components/AnalyticsContent';
import { useAssignments } from './hooks/useAssignments';
import { AssignmentFilter, AssignmentStatus } from './types/assignment';

export function InstructorAnalyticsPage() {
  // Use shared URL filter hook
  const { filter, setPage, setSize, setSearch, updateFilter } =
    useUrlFilter<AssignmentFilter>({
      defaultSize: 10,
      parseFilter: (params) => ({
        status: params.get('status') as AssignmentStatus | string | undefined,
      }),
    });

  // Filter handlers
  const onStatusFilter = useCallback(
    (status: AssignmentStatus | string | undefined) => {
      updateFilter({ status, page: 0 });
    },
    [updateFilter]
  );

  // Data fetching
  const { data, isLoading, isFetching, error, refetch } =
    useAssignments(filter);

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorDisplay
          error={error}
          onRetry={() => refetch()}
          title="Failed to load analytics"
          description="Please try again later."
        />
      </div>
    );
  }

  return (
    <AnalyticsContent
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      filter={filter}
      onSearch={setSearch}
      onStatusFilter={onStatusFilter}
      onPageChange={setPage}
      onPageSizeChange={setSize}
    />
  );
}

export default InstructorAnalyticsPage;
